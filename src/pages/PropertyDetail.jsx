import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import SEO from '../components/SEO';
import { MapPin, Bed, Bath, Maximize, Home, Check, ArrowLeft, Phone, Mail, Grid, FileText, X } from 'lucide-react';
import '../styles/Home.css'; // Reusing global styles
import '../styles/PropertyDetail.css'; // New responsive styles
import PropertyInquiryForm from '../components/PropertyInquiryForm';
import Breadcrumbs from '../components/Breadcrumbs';

import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { extractIdFromSlug, generatePropertySlug } from '../utils/slugify';

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

                // Generate the canonical slug for this property
                const canonicalSlug = generatePropertySlug(prop);

                // If the current URL doesn't match the canonical slug, redirect
                if (urlParam !== canonicalSlug) {
                    navigate(`/property/${canonicalSlug}`, { replace: true });
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
                <h2>Property not found</h2>
                <Link to="/catalog" className="btn">Back to listing</Link>
            </div>
        );
    }

    const { images } = media;
    const displayImages = images.length > 0 ? images : [{ url: property.image || 'https://via.placeholder.com/1200x600?text=No+Image', id: 'placeholder' }];

    // Safe Coordinate Handling
    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);
    const hasCoordinates = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    // Schema.org Structured Data - RealEstateListing
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": property.title,
        "description": property.description,
        "url": `https://www.azimutproperty.com/property/${urlParam}`,
        "image": displayImages.map(img => getOptimizedImageUrl(img.url, { width: 1200, height: 800, resize: 'cover' })),
        "datePosted": property.created_at,
        "offers": {
            "@type": "Offer",
            "price": property.price_on_demand ? undefined : property.price,
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock"
        },
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
        "broker": {
            "@type": "RealEstateAgent",
            "name": "Azimut Property",
            "url": "https://www.azimutproperty.com",
            "telephone": "+34-600-000-000",
            "email": "info@azimutproperty.com"
        }
    };

    // Breadcrumb schema (separate for better Google parsing)
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Properties", "item": "https://www.azimutproperty.com/venta" },
            { "@type": "ListItem", "position": 3, "name": property.title, "item": `https://www.azimutproperty.com/property/${urlParam}` }
        ]
    };

    return (
        <div className="page property-detail-page">
            <SEO title={`${property.title} | ${property.city}`} description={property.description?.substring(0, 160)} image={displayImages[0]?.url} url={`/property/${urlParam}`} keywords={`${property.type} ${property.city}, buy property ${property.city}, luxury real estate ${property.city}`} />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>

            {/* Header / Navigation Check */}
            <div className="container property-header-container" style={{ paddingBottom: 0 }}>
                <Breadcrumbs 
                    customItems={[
                        { label: 'Propiedades', link: '/venta' },
                        { label: property.province, link: `/venta/${property.province?.toLowerCase().replace(/\s+/g, '-')}` },
                        { label: property.title }
                    ]}
                />
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
                                    border: activeImage === idx ? '2px solid #3b82f6' : 'none',
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
                                <Bed size={24} color="#64748b" />
                                <div>
                                    <span className="spec-value">{property.bedrooms}</span>
                                    <span className="spec-label">Bedrooms</span>
                                </div>
                            </div>
                            <div className="spec-item">
                                <Bath size={24} color="#64748b" />
                                <div>
                                    <span className="spec-value">{property.bathrooms}</span>
                                    <span className="spec-label">Bathrooms</span>
                                </div>
                            </div>
                            <div className="spec-item">
                                <Maximize size={24} color="#64748b" />
                                <div>
                                    <span className="spec-value">{Number(property.area).toLocaleString()} m²</span>
                                    <span className="spec-label">Built</span>
                                </div>
                            </div>
                            {property.plot > 0 && (
                                <div className="spec-item">
                                    <Home size={24} color="#64748b" />
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
                            <p className="description-text">{property.description}</p>
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
                                            <FileText size={24} color="#3b82f6" />
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
                                    <Suspense fallback={<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>Loading map...</div>}>
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
