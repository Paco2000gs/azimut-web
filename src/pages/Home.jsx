import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import PropertyCard from '../components/PropertyCard';
import SEO from '../components/SEO';
import { Compass, Shield, Key } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
    const { properties, loading } = useProperties();
    // Get 3 properties for the featured section
    const featuredProperties = properties.slice(0, 3);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Schema.org for RealEstateAgent focused on Marbella / HNWI
    // Reference the global RealEstateAgent schema from index.html via @id
    // No need to duplicate — the full schema is in index.html <head>
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "@id": "https://www.azimutproperty.com/#organization",
        "name": "Azimut Property",
        "description": "Boutique real estate agency specialized in the luxury sector on the Costa del Sol. Specialists in exclusive real estate assets in Marbella, Estepona, and Benahavís.",
        "url": "https://www.azimutproperty.com/",
        "telephone": "+34-600-000-000",
        "logo": {
            "@type": "ImageObject",
            "url": "https://www.azimutproperty.com/azimut-logo-gold.png"
        },
        "image": "https://www.azimutproperty.com/azimut-logo-gold.png",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Marbella",
            "addressRegion": "Málaga",
            "addressCountry": "ES"
        },
        "areaServed": [
            { "@type": "City", "name": "Marbella", "sameAs": "https://www.wikidata.org/wiki/Q39347" },
            { "@type": "City", "name": "Estepona", "sameAs": "https://www.wikidata.org/wiki/Q843209" },
            { "@type": "City", "name": "Benahavís", "sameAs": "https://www.wikidata.org/wiki/Q2897197" },
            { "@type": "Place", "name": "Golden Mile" }
        ],
        "priceRange": "€€€€",
        "currenciesAccepted": "EUR",
        "contactPoint": {
            "@type": "ContactPoint",
            "email": "info@azimutproperty.com",
            "contactType": "customer service",
            "areaServed": "ES",
            "availableLanguage": ["Spanish", "English"]
        },
        "sameAs": [
            "https://www.instagram.com/azimutproperty",
            "https://www.linkedin.com/company/azimutproperty"
        ]
    };

    return (
        <div className="page home">
            <SEO
                title="Fincas, Cortijos y Villas en Andalucía | Azimut Property"
                description="Propiedades rurales y de lujo en Cádiz, Huelva, Sevilla y Marbella. Fincas, cortijos, haciendas y villas exclusivas. Asesoría personalizada para compradores nacionales e internacionales."
                url="/"
                keywords="fincas Andalucía, comprar cortijo Sevilla, casa rural Cádiz, chalet con terreno Huelva, propiedad rural inversión Andalucía, villas Marbella, luxury real estate Andalusia, hacienda olivar Sevilla"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <header className="hero-header-branded">
                        <span className="eyebrow-text">Exclusivity and Discretion in the Golden Triangle</span>
                        <h1 className="hero-title">
                            <span className="hero-subtitle">ELEVATE YOUR LIFESTYLE</span>
                            WITH THE MOST EXCLUSIVE <br /> PROPERTIES IN ANDALUSIA
                        </h1>
                        <p className="main-value-proposition">
                            Discover a curated collection of off-market properties and luxury residences
                            designed for wellness and longevity in Southern Spain.
                        </p>
                    </header>

                    <div className="cta-group-luxury">
                        <Link to="/catalog" className="btn btn-hero btn-primary-gold">Explore Exclusive Villas</Link>
                        <Link to="/contact" className="btn btn-hero btn-secondary-outline">Request Off-Market Catalogue</Link>
                    </div>

                    <div className="trust-indicators">
                        <span>RICS Regulated Standards</span>
                        <span className="separator">•</span>
                        <span>Global Network Excellence</span>
                    </div>
                </div>
            </section>

            {/* Authority Text Section */}
            <section className="section authority-section">
                <div className="container">
                    <div className="authority-content">
                        <p className="lead-text">
                            Specialists in the high-end real estate market in the Golden Triangle of Andalusia.
                            Azimut Property offers unprecedented access to the most exclusive properties in
                            Marbella, Benahavís, and Estepona.
                        </p>
                        <p>
                            From contemporary villas with industry-leading energy certification to the
                            coveted Branded Residences on the Golden Mile, our selection is designed for
                            those who prioritize privacy, sustainability, and well-being. In a market
                            driven by asset scarcity and record international demand, we provide the
                            market intelligence and discretion necessary to secure safe capital
                            investments and unparalleled lifestyles in Southern Europe.
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Properties */}
            <section className="section featured-section">
                <div className="container">
                    <div className="section-header decorative-header">
                        <h2>CURATED LUXURY RESIDENCES</h2>
                    </div>

                    {loading ? (
                        <div className="loading" role="status" aria-label="Loading properties">Loading exclusive listings...</div>
                    ) : (
                        <div className="featured-grid">
                            {featuredProperties.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}

                    <div className="view-all-container">
                        <Link to="/catalog" className="btn btn-gold">VIEW ALL PROPERTIES</Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="section why-choose-section">
                <div className="container">
                    <div className="section-header">
                        <h2>WHY CHOOSE AZIMUT PROPERTY?</h2>
                    </div>
                    <div className="value-grid">
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Compass size={40} strokeWidth={1} aria-hidden="true" />
                            </div>
                            <h3>UNPARALLELED EXPERTISE</h3>
                            <p>Refined and deep knowledge of the luxury real estate market in Andalusia's most exclusive locations.</p>
                        </div>
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Shield size={40} strokeWidth={1} aria-hidden="true" />
                            </div>
                            <h3>CONFIDENTIAL SERVICE</h3>
                            <p>Absolute discretion and confidentiality in every transaction. Your privacy is our top priority.</p>
                        </div>
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Key size={40} strokeWidth={1} aria-hidden="true" />
                            </div>
                            <h3>EXCLUSIVE LISTINGS ACCESS</h3>
                            <p>Privileged access to off-market properties and unique opportunities before they are published.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
