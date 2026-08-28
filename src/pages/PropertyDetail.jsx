import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import SEO from '../components/SEO';
import { MapPin, Bed, Bath, Maximize, Home, Check, ArrowLeft, Mail, Grid, FileText, X } from 'lucide-react';
import '../styles/Home.css'; // Reusing global styles
import '../styles/PropertyDetail.css'; // New responsive styles
import PropertyInquiryForm from '../components/PropertyInquiryForm';
import ShortlistButton from '../components/ShortlistButton';

import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { extractIdFromSlug, generatePropertySlug, generatePropertyPath, slugifyLocation } from '../utils/slugify';

// Lazy-load Leaflet map — saves ~153KB from initial bundle
const PropertyMap = lazy(() => import('../components/PropertyMap'));

/**
 * Descriptions are written in Markdown and were being dumped straight into
 * <p> tags, so "### Jardines italianos, lago y gruta" printed its hashes on
 * the page — 6 of them on the Constantina hacienda, 3 on the Sotogrande
 * palace — and every one of those headings, the ones carrying the words a
 * buyer actually searches for, counted as plain text.
 *
 * They render as <h3> because the section they live under ("Description") is
 * the <h2>: a heading must not outrank its own section.
 *
 * Single newlines inside a block are the author's hard wrap at ~90 columns,
 * not line breaks the reader should see. They collapse to spaces here so the
 * paragraph reflows on a phone instead of breaking mid-sentence.
 */
const renderDescription = (description) => {
    if (!description) return null;

    return description.split('\n\n').map((block, idx) => {
        const text = block.trim();
        if (!text) return null;

        const [firstLine, ...rest] = text.split('\n');
        const heading = firstLine.match(/^#{2,4}\s+(.+)$/);

        if (heading) {
            const body = rest.join(' ').replace(/\s+/g, ' ').trim();
            return (
                <React.Fragment key={idx}>
                    <h3 className="description-heading">{heading[1].trim()}</h3>
                    {body && <p style={{ marginBottom: '1rem', lineHeight: '1.8' }}>{body}</p>}
                </React.Fragment>
            );
        }

        return (
            <p key={idx} style={{ marginBottom: '1rem', lineHeight: '1.8' }}>
                {text.replace(/\s+/g, ' ')}
            </p>
        );
    });
};

/**
 * property_media.title holds the uploaded file name, and the names are
 * descriptive: "hacienda-constantina-05-piscina-olivos.webp" says exactly what
 * is in the frame. That was being thrown away in favour of "photo 5 of 14",
 * which tells a blind visitor — and Google Images — nothing.
 *
 * Everything up to and including the sequence number is the property slug, so
 * only what follows describes the shot. Names with no hyphens are the legacy
 * random uploads ("f3qx6ftjnpf.jpg") and carry no meaning: those fall back to
 * the numbered template at the call site.
 */
const captionFromFilename = (name) => {
    const base = (name || '').replace(/\.[a-z0-9]+$/i, '');
    const words = base.split('-').filter(Boolean);
    if (words.length < 3) return '';

    const sequence = words.findIndex(word => /^\d+$/.test(word));
    const described = sequence === -1 ? [] : words.slice(sequence + 1);
    if (described.length < 1) return '';

    const text = described.join(' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
};

const PropertyDetail = () => {
    const { id: urlParam } = useParams();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    // `properties` is taken here rather than by calling useProperties() again down
    // in the JSX: that second call sits after an early return, so the hook count
    // differed between renders.
    const { properties, getPropertyById, getPropertyMedia, loading: contextLoading } = useProperties();

    // Resolved before the first render, not inside the effect. Returning a
    // spinner first meant react-helmet-async's opening flush declared no tags,
    // so it stripped the prerendered canonical, description and og tags and
    // never put them back — every listing lost its head after hydration while
    // BlogPost, which finds its post on the first render, kept all of its.
    // With the prerendered data island seeded into the context this lookup
    // succeeds immediately; without one it returns undefined and the effect
    // fills it in as before.
    const initialProperty = getPropertyById(
        isNaN(parseInt(urlParam, 10)) ? extractIdFromSlug(urlParam) : urlParam
    ) || null;

    const [property, setProperty] = useState(initialProperty);
    const [media, setMedia] = useState({ images: [], plans: [], videos: [] });
    const [loading, setLoading] = useState(!initialProperty);
    const [activeImage, setActiveImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    // The enquiry form sits in the right column on desktop and below the whole
    // listing on a phone — 4.320px down, past description, features, videos and
    // map. The sticky bar at the bottom of this page jumps here instead.
    const formRef = useRef(null);
    const lightboxCloseRef = useRef(null);

    const scrollToForm = () => {
        const reduced = typeof window !== 'undefined'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        formRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    };

    // A lightbox that only closes by clicking its backdrop is a trap for anyone
    // on a keyboard: Escape closes it, and focus moves to the close button so
    // the next Tab stays inside the overlay instead of wandering the page under it.
    // The sticky bar steps aside once the form it points at is on screen, so it
    // never covers the fields the visitor came down to fill in.
    const [formInView, setFormInView] = useState(false);

    useEffect(() => {
        const node = formRef.current;
        if (!node || typeof IntersectionObserver === 'undefined') return;
        const observer = new IntersectionObserver(
            ([entry]) => setFormInView(entry.isIntersecting),
            { rootMargin: '-80px 0px 0px 0px' }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [property]);

    useEffect(() => {
        if (!showLightbox) return;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setShowLightbox(false);
        };
        document.addEventListener('keydown', onKeyDown);
        lightboxCloseRef.current?.focus();
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [showLightbox]);

    // The map is already a lazy chunk, but lazy only defers the download — the
    // component still mounts on load, and mounting is what fires ~14 tile
    // requests to openstreetmap.org. Googlebot's renderer cannot fetch those
    // (OSM's robots.txt disallows it), so they burned its resource budget on
    // every listing. Hold the mount until the section is actually near the
    // viewport: a crawler that never scrolls never pays for a map nobody saw.
    const mapRef = useRef(null);
    // A browser without IntersectionObserver starts with the map already
    // enabled, decided here rather than switched on from inside the effect so
    // the effect carries no synchronous setState.
    const [mapInView, setMapInView] = useState(
        typeof IntersectionObserver === 'undefined'
    );

    // One element for both the not-yet-observed and the chunk-loading states, so
    // the panel never changes height between them.
    const mapPlaceholder = (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-sunken)' }}>
            Loading map...
        </div>
    );

    useEffect(() => {
        const node = mapRef.current;
        if (!node || mapInView) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setMapInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '300px' }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [mapInView, property]);

    useEffect(() => {
        const loadData = async () => {
            // Never swap a rendered listing back for a spinner: unmounting SEO
            // would strip the head tags again, which is the bug this page just
            // came out of. Media arrives into an already-painted page.
            if (!initialProperty) setLoading(true);

            // Extract ID from URL parameter (could be slug or numeric ID)
            let propertyId = urlParam;

            // If it's a slug, extract the ID
            if (isNaN(parseInt(urlParam, 10))) {
                propertyId = extractIdFromSlug(urlParam);
            }

            // 1. Get Property Basic Info
            const prop = getPropertyById(propertyId);
            if (prop) {
                setProperty(prop);

                // Generate the canonical path for this property
                const canonicalSlug = generatePropertySlug(prop);
                const canonicalPath = generatePropertyPath(prop);

                // If the current URL doesn't match the canonical slug, redirect
                if (urlParam !== canonicalSlug) {
                    navigate(canonicalPath, { replace: true });
                }

                // 2. Get Property Media
                const mediaResult = await getPropertyMedia(propertyId);
                if (mediaResult.success) {
                    const allMedia = mediaResult.data || [];
                    const images = allMedia.filter(m => m.type === 'image');

                    // If property has a main image in the record but it's not in the media table yet (legacy), add it
                    if (prop.image && !images.find(img => img.url === prop.image)) {
                        images.unshift({ url: prop.image, id: 'main', type: 'image' });
                    }

                    setMedia({
                        images: images,
                        plans: allMedia.filter(m => m.type === 'plan'),
                        videos: allMedia.filter(m => m.type === 'video')
                    });
                }
            }
            setLoading(false);
        };

        if (!contextLoading) {
            loadData();
        }
    }, [urlParam, contextLoading, getPropertyById, getPropertyMedia, navigate]);

    if (loading || contextLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

    // Deliberately NOT noindex, and the canonical stays on this URL.
    //
    // This branch does not only mean "no such listing". PropertiesContext swallows a
    // failed Supabase query into `error` and leaves `properties` empty with `loading`
    // false, so a network blip lands here too — and it declared BOTH
    // `noindex, nofollow` AND (with no `url` prop) a canonical pointing at the home
    // page, overriding the correct tags baked into the prerendered HTML. Search
    // Console rejected /property/finca-jimena-de-la-frontera-8 on 17 Aug 2026 for
    // exactly that, while the served HTML and a normal browser both showed
    // "index, follow".
    //
    // Nothing is lost by dropping it: a URL that never existed never reaches React,
    // because vercel.json's rewrites are scoped and the edge answers a real 404 first.
    if (!property) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <SEO title="Property Not Found" url={pathname} lang="en" />
                <h2>Property not found</h2>
                <Link to="/venta" className="btn">Back to listing</Link>
            </div>
        );
    }

    const { images } = media;
    const displayImages = images.length > 0 ? images : [{ url: property.image || '/media/placeholder.svg', id: 'placeholder' }];

    // Lead with what the photo shows, then say which property it belongs to.
    // Photos with no usable file name keep the numbered form so the alt is
    // never empty and never a duplicate of its neighbour.
    const imageAlt = (img, idx) => {
        const caption = captionFromFilename(img?.title);
        if (!caption) {
            return `${property.title} — ${property.type} in ${property.city}, photo ${idx + 1} of ${displayImages.length}`;
        }
        // Several titles already name the town ("...en Constantina, Sevilla"),
        // and repeating it would end the alt with "Constantina, Sevilla, Constantina".
        const namesCity = property.title?.toLowerCase().includes((property.city || '').toLowerCase());
        return namesCity
            ? `${caption} — ${property.title}`
            : `${caption} — ${property.title}, ${property.city}`;
    };

    // Safe Coordinate Handling
    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);
    const hasCoordinates = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    // Build rich SEO meta description
    const plotDisplay = property.plot > 0
        ? (property.type?.trim().toLowerCase() === 'finca'
            ? `${(Number(property.plot) / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })} ha plot`
            : `${Number(property.plot).toLocaleString()} m² plot`)
        : '';
    const priceDisplay = property.price_on_demand ? 'Price on demand' : `€${property.price?.toLocaleString()}`;
    const seoDescription = `${property.title} in ${property.city}, ${property.province}. ${property.bedrooms} bed, ${property.bathrooms} bath, ${Number(property.area).toLocaleString()} m² built${plotDisplay ? `, ${plotDisplay}` : ''}. ${priceDisplay}. ${property.description?.substring(0, 200)}`;

    // Schema.org Structured Data - RealEstateListing
    const canonicalSlug = generatePropertySlug(property);
    const canonicalPropertyPath = generatePropertyPath(property);
    const canonicalUrl = `https://www.azimutproperty.com${canonicalPropertyPath}`;

    const imageObjects = displayImages.map((img, idx) => ({
        "@type": "ImageObject",
        "url": getOptimizedImageUrl(img.url, { raw: true }),
        "width": 1200,
        "height": 800,
        "caption": imageAlt(img, idx)
    }));

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "@id": `${canonicalUrl}#listing`,
        "name": property.title,
        "description": property.description,
        "url": canonicalUrl,
        "image": imageObjects,
        "datePosted": property.created_at,
        "offers": property.price_on_demand
            ? { "@type": "Offer", "availability": "https://schema.org/InStock" }
            : { "@type": "Offer", "price": String(property.price), "priceCurrency": "EUR", "availability": "https://schema.org/InStock" },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": property.city,
            "addressRegion": property.province,
            "addressCountry": "ES"
        },
        ...(hasCoordinates && {
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": lat,
                "longitude": lng
            }
        }),
        "numberOfBedrooms": property.bedrooms,
        "numberOfBathroomsTotal": property.bathrooms,
        "floorSize": {
            "@type": "QuantitativeValue",
            "value": property.area,
            "unitCode": "MTK"
        },
        ...(property.plot > 0 && {
            "lotSize": {
                "@type": "QuantitativeValue",
                "value": property.plot,
                "unitCode": "MTK"
            }
        }),
        ...(property.features && property.features.length > 0 && {
            "amenityFeature": property.features.map(f => ({
                "@type": "LocationFeatureSpecification",
                "name": f,
                "value": true
            })),
            "additionalProperty": [
                ...property.features.map(f => ({
                    "@type": "PropertyValue",
                    "name": f,
                    "value": f
                })),
                { "@type": "PropertyValue", "name": "Property Type", "value": property.type }
            ]
        }),
        "broker": {
            "@type": "RealEstateAgent",
            "@id": "https://www.azimutproperty.com/#organization",
            "name": "Azimut Property",
            "url": "https://www.azimutproperty.com",
            "email": "info@azimutproperty.com"
        }
    };

    // Breadcrumb schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Properties", "item": "https://www.azimutproperty.com/venta" },
            { "@type": "ListItem", "position": 3, "name": property.province, "item": `https://www.azimutproperty.com/venta/${slugifyLocation(property.province)}` },
            { "@type": "ListItem", "position": 4, "name": property.city, "item": `https://www.azimutproperty.com/venta/${slugifyLocation(property.city)}` },
            { "@type": "ListItem", "position": 5, "name": property.title, "item": canonicalUrl }
        ]
    };

    // FAQPage schema for property-specific questions
    const propertyFaqs = [
        {
            q: `What is the price of ${property.title} in ${property.city}?`,
            a: property.price_on_demand
                ? `The price for ${property.title} is available on demand. Contact Azimut Property for a private consultation.`
                : `${property.title} is listed at €${property.price?.toLocaleString()}. This ${property.type?.toLowerCase()} in ${property.city}, ${property.province} offers ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, and ${Number(property.area).toLocaleString()} m² of built area.`
        },
        {
            q: `Where is ${property.title} located?`,
            a: `${property.title} is located in ${property.city}, in the province of ${property.province}, Andalusia, Spain. ${property.city} is known for its natural beauty and authentic Andalusian charm.`
        },
        {
            q: `What features does ${property.title} include?`,
            a: property.features && property.features.length > 0
                ? `${property.title} features: ${property.features.join(', ')}. The property has ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${Number(property.area).toLocaleString()} m² built${plotDisplay ? ` and ${plotDisplay}` : ''}.`
                : `${property.title} offers ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, and ${Number(property.area).toLocaleString()} m² of built area${plotDisplay ? ` on a ${plotDisplay}` : ''}.`
        },
        {
            q: `Can a foreigner buy property in ${property.city}, Spain?`,
            a: `Yes, there are no restrictions for foreign buyers purchasing property in ${property.city} or anywhere in Spain. EU and non-EU citizens can buy freely. Azimut Property manages the entire process including NIE application, due diligence, and notarial closing.`
        }
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": propertyFaqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    return (
        <div className="page property-detail-page">
            <SEO
                title={`${property.title} — ${property.type} in ${property.city}, ${property.province}`}
                description={seoDescription.substring(0, 320)}
                image={getOptimizedImageUrl(displayImages[0]?.url, { raw: true })}
                imageDimensions={{ width: 1200, height: 630 }}
                url={canonicalPropertyPath}
                type="article"
                lang="en"
                keywords={`${property.type} ${property.city}, buy ${property.type?.toLowerCase()} ${property.city}, ${property.type?.toLowerCase()} for sale ${property.province}, luxury real estate ${property.city}, property ${property.city} Spain, finca ${property.city}, country estate ${property.province}`}
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            </Helmet>

            {/* Breadcrumbs UI */}
            <div className="container property-header-container">
                <nav className="breadcrumbs" aria-label="Breadcrumb">
                    <ol>
                        <li><Link to="/">Home</Link></li>
                        <li aria-hidden="true" className="breadcrumb-sep">/</li>
                        <li><Link to="/venta">Properties</Link></li>
                        <li aria-hidden="true" className="breadcrumb-sep">/</li>
                        <li>
                            <Link to={`/venta/${slugifyLocation(property.province)}`}>
                                {property.province}
                            </Link>
                        </li>
                        <li aria-hidden="true" className="breadcrumb-sep">/</li>
                        <li>
                            <Link to={`/venta/${slugifyLocation(property.city)}`}>
                                {property.city}
                            </Link>
                        </li>
                        <li aria-hidden="true" className="breadcrumb-sep">/</li>
                        <li><span aria-current="page">{property.title}</span></li>
                    </ol>
                </nav>
            </div>

            {/* ERROR FIX: Only render gallery if we have images */}
            <div className="container">
                {/* GALLERY SECTION */}
                <div className="property-gallery-container">
                    {/* Main Image */}
                    <div className="gallery-main">
                        <button
                            type="button"
                            className="gallery-main-trigger"
                            onClick={() => setShowLightbox(true)}
                            aria-label={`Open full screen view — ${imageAlt(displayImages[activeImage], activeImage)}`}
                        >
                            <img
                                src={getOptimizedImageUrl(displayImages[activeImage]?.url, { width: 1200, height: 800, resize: 'cover' })}
                                srcSet={`${getOptimizedImageUrl(displayImages[activeImage]?.url, { width: 800, height: 533, resize: 'cover' })} 800w, ${getOptimizedImageUrl(displayImages[activeImage]?.url, { width: 1200, height: 800, resize: 'cover' })} 1200w`}
                                sizes="(max-width: 768px) 100vw, 1200px"
                                alt={imageAlt(displayImages[activeImage], activeImage)}
                                width={1200}
                                height={800}
                            />
                        </button>
                        <div className="price-tag">
                            {property.price_on_demand ? "Price On Demand" : `€${property.price?.toLocaleString()}`}
                            {!property.price_on_demand && property.price && property.area > 0 && (
                                <span style={{ fontSize: '0.75rem', opacity: 0.85, display: 'block', marginTop: '2px' }}>
                                    €{Math.round(property.price / property.area).toLocaleString()}/m²
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Thumbnails Grid */}
                    <div className="gallery-thumbnails">
                        {displayImages.map((img, idx) => (
                            <button
                                type="button"
                                key={img.id}
                                className="thumbnail-item"
                                onClick={() => setActiveImage(idx)}
                                aria-current={activeImage === idx ? 'true' : undefined}
                                style={{
                                    opacity: activeImage === idx ? 1 : 0.6,
                                    border: activeImage === idx ? '2px solid var(--gold-ink)' : 'none',
                                }}
                            >
                                <img
                                    src={getOptimizedImageUrl(img.url, { width: 200, height: 150, resize: 'cover' })}
                                    alt={imageAlt(img, idx)}
                                    width={200}
                                    height={150}
                                    loading="lazy"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="property-content-layout">
                    {/* LEFT COLUMN: Details */}
                    <div className="property-main-info">
                        <div className="location-badge">
                            <MapPin size={16} /> {property.city}, {property.province}
                        </div>

                        <h1 className="property-title">{property.title}</h1>

                        {/* Specs Bar */}
                        <div className="specs-bar">
                            <div className="spec-item">
                                <Bed size={24} color="var(--ink-500)" />
                                <div>
                                    <span className="spec-value">{property.bedrooms}</span>
                                    <span className="spec-label">Bedrooms</span>
                                </div>
                            </div>
                            <div className="spec-item">
                                <Bath size={24} color="var(--ink-500)" />
                                <div>
                                    <span className="spec-value">{property.bathrooms}</span>
                                    <span className="spec-label">Bathrooms</span>
                                </div>
                            </div>
                            <div className="spec-item">
                                <Maximize size={24} color="var(--ink-500)" />
                                <div>
                                    <span className="spec-value">{Number(property.area).toLocaleString()} m²</span>
                                    <span className="spec-label">Built</span>
                                </div>
                            </div>
                            {property.plot > 0 && (
                                <div className="spec-item">
                                    <Home size={24} color="var(--ink-500)" />
                                    <div>
                                        <span className="spec-value">
                                            {property.type?.trim().toLowerCase() === 'finca'
                                                ? `${(Number(property.plot) / 10000).toLocaleString(undefined, { maximumFractionDigits: 2 })} ha`
                                                : `${Number(property.plot).toLocaleString()} m²`
                                            }
                                        </span>
                                        <span className="spec-label">Plot</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="content-section">
                            <h2 className="section-title">Description</h2>
                            <div className="description-text">
                                {renderDescription(property.description)}
                            </div>
                        </div>

                        {/* Features */}
                        {property.features && property.features.length > 0 && (
                            <div className="content-section">
                                <h2 className="section-title">Features</h2>
                                <div className="features-grid">
                                    {property.features.map((feature, idx) => (
                                        <div key={idx} className="feature-tag">
                                            <div className="check-icon">
                                                <Check size={14} />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Plans Section */}
                        {media.plans.length > 0 && (
                            <div className="content-section">
                                <h2 className="section-title">Floor Plans</h2>
                                <div className="plans-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    {media.plans.map(plan => (
                                        <a key={plan.id} href={plan.url} className="plan-link" target="_blank" rel="noopener noreferrer">
                                            <FileText size={24} color="var(--gold-ink)" />
                                            <span>{plan.title || 'View Plan'}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Videos Section */}
                        {media.videos.length > 0 && (
                            <div className="content-section">
                                <h2 className="section-title">Videos</h2>
                                <div className="media-grid">
                                    {media.videos.map((video, index) => {
                                        // Uploaded titles are often just the file name ("25_en.mp4").
                                        // Printing that on a listing reads as an unfinished page, so a
                                        // filename is treated as no title at all.
                                        const rawTitle = (video.title || '').trim();
                                        const isFilename = /\.(mp4|mov|webm|m4v|avi)$/i.test(rawTitle);
                                        const caption = isFilename ? '' : rawTitle;
                                        const label = caption
                                            ? `${property.title} — ${caption}`
                                            : `${property.title} — video ${index + 1} of ${media.videos.length}`;
                                        return (
                                        <div key={video.id} className="video-container">
                                            {/* Without a poster the player is a black rectangle until
                                                someone gambles on it. The listing's own first photo is
                                                the frame most likely to earn that click, and preload
                                                stays off so a 22MB file is never fetched unasked. */}
                                            <video
                                                controls
                                                aria-label={label}
                                                poster={getOptimizedImageUrl(displayImages[0]?.url, { width: 1200, height: 800, resize: 'cover' })}
                                                preload="none"
                                                style={{ width: '100%', maxHeight: '500px', display: 'block' }}
                                                crossOrigin="anonymous"
                                            >
                                                <source src={video.url} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                            {caption && <div className="video-caption">{caption}</div>}
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Map Section */}
                        {hasCoordinates && (
                            <div className="content-section">
                                <h2 className="section-title">Location</h2>
                                <div className="map-container" ref={mapRef} style={{ height: '400px' }}>
                                    {mapInView ? (
                                        <Suspense fallback={mapPlaceholder}>
                                            <PropertyMap lat={lat} lng={lng} title={property.title} />
                                        </Suspense>
                                    ) : mapPlaceholder}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: Contact Agent */}
                    <div className="property-sidebar-wrapper" ref={formRef}>
                        <div className="agent-card" style={{ padding: 0, border: 'none', boxShadow: 'none' }}>
                            <PropertyInquiryForm propertyId={property.id} propertyTitle={property.title} />
                        </div>
                        
                        {/* QUICK CONTACT BUTTONS */}
                        <div className="quick-contact-actions" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <ShortlistButton property={property} variant="labelled" />
                            <a
                                href={`mailto:info@azimutproperty.com?subject=${encodeURIComponent('Enquiry: ' + property.title)}`}
                                className="email-contact-btn"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    background: 'var(--surface-dark)',
                                    color: 'var(--ink-inverse)',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <Mail size={18} aria-hidden="true" /> Email us about this property
                            </a>
                        </div>
                    </div>
                </div>

                {/* FAQ SECTION — Boosts AI citation & GEO visibility */}
                <div className="property-faqs" style={{ marginTop: '4rem', borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', color: 'var(--ink-800)' }}>Frequently Asked Questions</h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {propertyFaqs.map((faq, idx) => (
                            <details key={idx} style={{ background: 'var(--surface-sunken)', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer' }}>
                                <summary style={{ fontWeight: '600', color: 'var(--ink-800)', fontSize: '1rem' }}>{faq.q}</summary>
                                <p style={{ color: 'var(--ink-500)', marginTop: '0.75rem', lineHeight: '1.7' }}>{faq.a}</p>
                            </details>
                        ))}
                    </div>
                    <p className="faq-guide-link">
                        <Link to="/buying-guide">
                            The full process for a non-resident buyer — NIE, notary, taxes and timeline
                        </Link>
                    </p>
                </div>

                {/* RELATED PROPERTIES SECTION */}
                <div className="related-properties" style={{ marginTop: '5rem', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem', color: 'var(--ink-800)' }}>More properties in {property.province}</h2>
                    <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {properties
                            .filter(p => p.province === property.province && p.id !== property.id)
                            .slice(0, 3)
                            .map(related => (
                                <Link key={related.id} to={generatePropertyPath(related)} className="related-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: '#fff', transition: 'transform 0.2s' }}>
                                        <img
                                            src={getOptimizedImageUrl(related.image, { width: 400, height: 260, resize: 'cover' })}
                                            alt={related.title}
                                            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                        />
                                        <div style={{ padding: '1.25rem' }}>
                                            <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--ink-800)' }}>{related.title}</h4>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <MapPin size={14} /> {related.city}
                                            </div>
                                            <div style={{ marginTop: '1rem', fontWeight: '700', color: 'var(--gold-ink)' }}>
                                                {related.price_on_demand ? "Consultar Precio" : `€${related.price?.toLocaleString()}`}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </div>
            {/* Mobile enquiry bar. On a phone the form is the last thing on the
                page; this keeps the ask one tap away from wherever the visitor
                stopped scrolling. Hidden from 900px up, where the form is
                already in the right-hand column. */}
            <div className={`mobile-enquiry-bar${formInView ? ' is-hidden' : ''}`}>
                <div className="mobile-enquiry-price">
                    <span className="mobile-enquiry-label">{property.city}</span>
                    <strong>{property.price_on_demand ? 'Price on demand' : `€${property.price?.toLocaleString()}`}</strong>
                </div>
                <button type="button" className="mobile-enquiry-button" onClick={scrollToForm}>
                    Request dossier
                </button>
            </div>

            {/* Lightbox Overlay */}
            {showLightbox && (
                <div
                    className="lightbox-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${property.title} — full screen photo`}
                    onClick={() => setShowLightbox(false)}
                >
                    <img
                        className="lightbox-image"
                        src={getOptimizedImageUrl(displayImages[activeImage]?.url, { width: 1600, quality: 90 })}
                        alt={imageAlt(displayImages[activeImage], activeImage)}
                        onClick={(event) => event.stopPropagation()}
                    />
                    <button
                        ref={lightboxCloseRef}
                        className="lightbox-close"
                        onClick={() => setShowLightbox(false)}
                    >
                        <X size={24} /> Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default PropertyDetail;
