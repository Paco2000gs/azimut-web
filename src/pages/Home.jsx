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
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": "Azimut Property",
        "description": "Inmobiliaria boutique especializada en el sector de lujo en la Costa del Sol. Especialistas en activos inmobiliarios exclusivos en Marbella, Estepona y Benahavís.",
        "url": "https://www.azimutproperty.com/",
        "telephone": "+34-600-000-000",
        "logo": "https://www.azimutproperty.com/azimut-logo-gold.png",
        "image": "https://www.azimutproperty.com/azimut-logo-gold.png",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Marbella",
            "addressRegion": "Andalucía",
            "addressCountry": "ES"
        },
        "areaServed": [
            { "@type": "City", "name": "Marbella" },
            { "@type": "City", "name": "Estepona" },
            { "@type": "City", "name": "Benahavís" },
            { "@type": "Place", "name": "Milla de Oro" }
        ],
        "priceRange": "€1,000,000 - €50,000,000",
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
                title="Azimut Property | Propiedades de Lujo y Villas en Marbella y Andalucía"
                description="Especialistas en activos inmobiliarios exclusivos en Marbella, Estepona y Benahavís. Acceso a villas off-market, branded residences y asesoría experta para inversores HNWI en Andalucía."
                url="/"
            />
            <Helmet>
                <meta name="keywords" content="luxury villas Marbella, real estate Andalusia, Marbella Golden Mile properties, investment homes Benahavis, sustainable luxury villas" />
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <header className="hero-header-branded">
                        <span className="eyebrow-text">Exclusividad y Discreción en el Triángulo de Oro</span>
                        <h1>
                            <span className="hero-subtitle">ELEVE SU ESTILO DE VIDA</span>
                            CON LAS PROPIEDADES <br /> MÁS EXCLUSIVAS DE ANDALUCÍA
                        </h1>
                        <p className="main-value-proposition">
                            Descubra una colección curada de propiedades off-market y residencias de lujo
                            diseñadas para el bienestar y la longevidad en el sur de España.
                        </p>
                    </header>

                    <div className="cta-group-luxury">
                        <Link to="/catalog" className="btn btn-hero btn-primary-gold">Explorar Villas Exclusivas</Link>
                        <Link to="/contact" className="btn btn-hero btn-secondary-outline">Solicitar Catálogo Off-Market</Link>
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
                            Especialistas en el mercado inmobiliario de alta gama en el Triángulo de Oro de Andalucía.
                            Azimut Property ofrece un acceso sin precedentes a las propiedades más exclusivas de
                            Marbella, Benahavís y Estepona.
                        </p>
                        <p>
                            Desde villas contemporáneas con certificación energética líder en la industria hasta las
                            codiciadas Branded Residences en la Milla de Oro, nuestra selección está diseñada para
                            aquellos que priorizan la privacidad, la sostenibilidad y el bienestar. En un mercado
                            impulsado por la escasez de activos y una demanda internacional récord, proporcionamos
                            la inteligencia de mercado y la discreción necesarias para asegurar inversiones de capital
                            seguras y estilos de vida inigualables en el sur de Europa.
                        </p>
                    </div>
                </div>
            </section>

            {/* Featured Properties */}
            <section className="section featured-section">
                <div className="container">
                    <div className="section-header decorative-header">
                        <h2>RESIDENCIAS DE LUJO SELECCIONADAS</h2>
                    </div>

                    {loading ? (
                        <div className="loading" role="status" aria-label="Cargando propiedades">Cargando listados exclusivos...</div>
                    ) : (
                        <div className="featured-grid">
                            {featuredProperties.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}

                    <div className="view-all-container">
                        <Link to="/catalog" className="btn btn-gold">VER TODAS LAS PROPIEDADES</Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="section why-choose-section">
                <div className="container">
                    <div className="section-header">
                        <h2>¿POR QUÉ ELEGIR AZIMUT PROPERTY?</h2>
                    </div>
                    <div className="value-grid">
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Compass size={40} strokeWidth={1} aria-hidden="true" />
                            </div>
                            <h3>EXPERIENCIA INCOMPARABLE</h3>
                            <p>Conocimiento refinado y profundo del mercado inmobiliario de lujo en las ubicaciones más exclusivas de Andalucía.</p>
                        </div>
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Shield size={40} strokeWidth={1} aria-hidden="true" />
                            </div>
                            <h3>SERVICIO CONFIDENCIAL</h3>
                            <p>Discreción y confidencialidad absoluta en cada operación. Su privacidad es nuestra máxima prioridad.</p>
                        </div>
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Key size={40} strokeWidth={1} aria-hidden="true" />
                            </div>
                            <h3>ACCESO A PROPIEDADES EXCLUSIVAS</h3>
                            <p>Acceso privilegiado a propiedades fuera de mercado y oportunidades únicas antes de su publicación.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
