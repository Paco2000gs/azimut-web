import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import SEO from '../components/SEO';
import { MapPin, Bed, Bath, Maximize, Home, Check, ArrowLeft, Mail, Grid, FileText, X } from 'lucide-react';
import '../styles/Home.css'; // Reusing global styles
import '../styles/PropertyDetail.css'; // New responsive styles
import PropertyInquiryForm from '../components/PropertyInquiryForm';

import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { extractIdFromSlug, generatePropertySlug, generatePropertyPath, getCustomSlugForId } from '../utils/slugify';

// Lazy-load Leaflet map — saves ~153KB from initial bundle
const PropertyMap = lazy(() => import('../components/PropertyMap'));

const PropertyDetail = () => {
    const { id: urlParam } = useParams();
    const navigate = useNavigate();
    const { getPropertyById, getPropertyMedia, loading: contextLoading } = useProperties();
    const [property, setProperty] = useState(null);
    const [media, setMedia] = useState({ images: [], plans: [], videos: [] });
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

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

    if (!property) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <SEO title="Property Not Found" noindex={true} />
                <h2>Property not found</h2>
                <Link to="/venta" className="btn">Back to listing</Link>
            </div>
        );
    }

    const { images } = media;
    const displayImages = images.length > 0 ? images : [{ url: property.image || '/media/placeholder.svg', id: 'placeholder' }];

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
        "url": getOptimizedImageUrl(img.url, { width: 1200, height: 800, resize: 'cover' }),
        "width": 1200,
        "height": 800,
        "caption": `${property.title} — photo ${idx + 1}, ${property.city}, ${property.province}`
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
            { "@type": "ListItem", "position": 3, "name": property.province, "item": `https://www.azimutproperty.com/venta/${property.province?.toLowerCase().replace(/\s+/g, '-')}` },
            { "@type": "ListItem", "position": 4, "name": property.city, "item": `https://www.azimutproperty.com/venta/${property.city?.toLowerCase().replace(/\s+/g, '-')}` },
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
                image={getOptimizedImageUrl(displayImages[0]?.url, { width: 1200, height: 630, resize: 'cover' })}
                url={canonicalPropertyPath}
                type="article"
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
                            <Link to={`/venta/${property.province?.toLowerCase().replace(/\s+/g, '-')}`}>
                                {property.province}
                            </Link>
                        </li>
                        <li aria-hidden="true" className="breadcrumb-sep">/</li>
                        <li>
                            <Link to={`/venta/${property.city?.toLowerCase().replace(/\s+/g, '-')}`}>
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
                        <img
                            src={getOptimizedImageUrl(displayImages[activeImage]?.url, { width: 1200, height: 800, resize: 'cover' })}
                            srcSet={`${getOptimizedImageUrl(displayImages[activeImage]?.url, { width: 800, height: 533, resize: 'cover' })} 800w, ${getOptimizedImageUrl(displayImages[activeImage]?.url, { width: 1200, height: 800, resize: 'cover' })} 1200w`}
                            sizes="(max-width: 768px) 100vw, 1200px"
                            alt={`${property.title} — ${property.type} in ${property.city}, ${property.province}`}
                            width={1200}
                            height={800}
                            onClick={() => setShowLightbox(true)}
                        />
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
                            <div
                                key={img.id}
                                className="thumbnail-item"
                                onClick={() => setActiveImage(idx)}
                                style={{
                                    opacity: activeImage === idx ? 1 : 0.6,
                                    border: activeImage === idx ? '2px solid var(--gold-ink)' : 'none',
                                }}
                            >
                                <img
                                    src={getOptimizedImageUrl(img.url, { width: 200, height: 150, resize: 'cover' })}
                                    alt={`${property.title} — photo ${idx + 1} of ${displayImages.length}`}
                                    width={200}
                                    height={150}
                                    loading="lazy"
                                />
                            </div>
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
                            <h3 className="section-title">Description</h3>
                            <div className="description-text">
                                {property.description?.split('\n\n').map((paragraph, idx) => (
                                    <p key={idx} style={{ marginBottom: '1rem', lineHeight: '1.8' }}>{paragraph}</p>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        {property.features && property.features.length > 0 && (
                            <div className="content-section">
                                <h3 className="section-title">Features</h3>
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
                                <h3 className="section-title">Floor Plans</h3>
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
                                <h3 className="section-title">Videos</h3>
                                <div className="media-grid">
                                    {media.videos.map(video => (
                                        <div key={video.id} className="video-container">
                                            <video controls style={{ width: '100%', maxHeight: '500px', display: 'block' }} crossOrigin="anonymous">
                                                <source src={video.url} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                            {video.title && <div style={{ padding: '1rem', background: 'white', fontWeight: '500' }}>{video.title}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Map Section */}
                        {hasCoordinates && (
                            <div className="content-section">
                                <h3 className="section-title">Location</h3>
                                <div className="map-container" style={{ height: '400px' }}>
                                    <Suspense fallback={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-sunken)' }}>Loading map...</div>}>
                                        <PropertyMap lat={lat} lng={lng} title={property.title} />
                                    </Suspense>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: Contact Agent */}
                    <div className="property-sidebar-wrapper">
                        <div className="agent-card" style={{ padding: 0, border: 'none', boxShadow: 'none' }}>
                            <PropertyInquiryForm propertyId={property.id} propertyTitle={property.title} />
                        </div>
                        
                        {/* QUICK CONTACT BUTTONS */}
                        <div className="quick-contact-actions" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <a
                                href={`mailto:info@azimutproperty.com?subject=${encodeURIComponent('Interés en la propiedad: ' + property.title)}`}
                                className="email-contact-btn"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    background: 'var(--surface-dark)',
                                    color: '#fff',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <Mail size={18} /> Contactar por email
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
                </div>

                {/* RELATED PROPERTIES SECTION */}
                <div className="related-properties" style={{ marginTop: '5rem', borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', color: 'var(--ink-800)' }}>Propiedades Similares en {property.province}</h3>
                    <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {useProperties().properties
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
            {/* Lightbox Overlay */}
            {showLightbox && (
                <div
                    className="lightbox-overlay"
                    onClick={() => setShowLightbox(false)}
                >
                    <img
                        className="lightbox-image"
                        src={getOptimizedImageUrl(displayImages[activeImage]?.url, { width: 1600, quality: 90 })}
                        alt={`${property.title} — full screen view`}
                    />
                    <button
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
