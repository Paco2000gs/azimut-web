import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import SEO from '../components/SEO';
import { MapPin, Bed, Bath, Maximize, Home, Check, ArrowLeft, Phone, Mail, Grid, FileText, X } from 'lucide-react';
import '../styles/Home.css'; // Reusing global styles
import '../styles/PropertyDetail.css'; // New responsive styles
import PropertyInquiryForm from '../components/PropertyInquiryForm';

import { getOptimizedImageUrl } from '../utils/imageOptimizer';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom Icon Setup to avoid "d is not a function" errors with global prototype hacks
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const PropertyDetail = () => {
    const { id } = useParams();
    const { getPropertyById, getPropertyMedia, loading: contextLoading } = useProperties();
    const [property, setProperty] = useState(null);
    const [media, setMedia] = useState({ images: [], plans: [], videos: [] });
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            // 1. Get Property Basic Info
            const prop = getPropertyById(id);
            if (prop) {
                setProperty(prop);

                // 2. Get Property Media
                const mediaResult = await getPropertyMedia(id);
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
    }, [id, contextLoading, getPropertyById, getPropertyMedia]);

    if (loading || contextLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

    if (!property) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Propiedad no encontrada</h2>
                <Link to="/catalog" className="btn">Volver al listado</Link>
            </div>
        );
    }

    const { images } = media;
    const displayImages = images.length > 0 ? images : [{ url: property.image || 'https://via.placeholder.com/1200x600?text=No+Image', id: 'placeholder' }];

    // Safe Coordinate Handling
    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);
    const hasCoordinates = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

    // Schema.org Structured Data
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": property.title,
        "description": property.description,
        "url": window.location.href,
        "image": displayImages.map(img => img.url),
        "datePosted": property.created_at,
        "offers": {
            "@type": "Offer",
            "price": property.price,
            "priceCurrency": "EUR"
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": property.city,
            "addressRegion": property.province,
            "addressCountry": "ES"
        }
    };

    return (
        <div className="page property-detail-page">
            <SEO title={`${property.title} | Azimut`} description={property.description?.substring(0, 160)} image={displayImages[0]?.url} />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>

            {/* Header / Navigation Check */}
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
                <Link to="/catalog" className="back-link">
                    <ArrowLeft size={18} /> Volver a Propiedades
                </Link>
            </div>

            {/* ERROR FIX: Only render gallery if we have images */}
            <div className="container">
                {/* GALLERY SECTION */}
                <div className="property-gallery-container">
                    {/* Main Image */}
                    <div className="gallery-main">
                        <img
                            src={getOptimizedImageUrl(displayImages[activeImage]?.url, { width: 1200, height: 800, resize: 'cover' })}
                            alt={property.title}
                            onClick={() => setShowLightbox(true)}
                        />
                        <div className="price-tag">
                            €{property.price?.toLocaleString()}
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
                                    alt={`View ${idx}`}
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
                                    <span className="spec-label">Dormitorios</span>
                                </div>
                            </div>
                            <div className="spec-item">
                                <Bath size={24} color="#64748b" />
                                <div>
                                    <span className="spec-value">{property.bathrooms}</span>
                                    <span className="spec-label">Baños</span>
                                </div>
                            </div>
                            <div className="spec-item">
                                <Maximize size={24} color="#64748b" />
                                <div>
                                    <span className="spec-value">{Number(property.area).toLocaleString()} m²</span>
                                    <span className="spec-label">Construidos</span>
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
                                        <span className="spec-label">Parcela</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="content-section">
                            <h3 className="section-title">Descripción</h3>
                            <p className="description-text">{property.description}</p>
                        </div>

                        {/* Features */}
                        {property.features && property.features.length > 0 && (
                            <div className="content-section">
                                <h3 className="section-title">Características</h3>
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
                                <h3 className="section-title">Planos</h3>
                                <div className="plans-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    {media.plans.map(plan => (
                                        <a key={plan.id} href={plan.url} className="plan-link" target="_blank" rel="noopener noreferrer">
                                            <FileText size={24} color="#3b82f6" />
                                            <span>{plan.title || 'Ver Plano'}</span>
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
                                <h3 className="section-title">Ubicación</h3>
                                <div className="map-container" style={{ height: '400px' }}>
                                    <MapContainer
                                        key={`${lat}-${lng}`} // Helper to force re-render if coordinates change
                                        center={[lat, lng]}
                                        zoom={15}
                                        scrollWheelZoom={false}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[lat, lng]} icon={defaultIcon}>
                                            <Popup>
                                                {property.title}
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
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
                        alt="Full Screen"
                    />
                    <button
                        className="lightbox-close"
                        onClick={() => setShowLightbox(false)}
                    >
                        <X size={24} /> Cerrar
                    </button>
                </div>
            )}
        </div>
    );
};

export default PropertyDetail;
