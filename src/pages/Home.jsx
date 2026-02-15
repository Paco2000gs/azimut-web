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

    return (
        <div className="page home">
            <SEO
                title="Inicio"
                description="Eleve su estilo de vida con las propiedades más exclusivas de Andalucía. Descubra residencias de lujo seleccionadas en Marbella, Sotogrande, Cádiz y más."
                url="/"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "RealEstateAgent",
                        "name": "Azimut Property",
                        "url": "https://www.azimutproperty.com",
                        "logo": "https://www.azimutproperty.com/azimut-logo-gold.png",
                        "image": "https://www.azimutproperty.com/azimut-logo-gold.png",
                        "description": "Agencia inmobiliaria de lujo exclusiva en Andalucía, España. Villas, áticos y fincas en Marbella, Cádiz, Sevilla y Málaga.",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Sevilla",
                            "addressRegion": "Andalucía",
                            "addressCountry": "ES"
                        },
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
                    })}
                </script>
            </Helmet>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <h1>
                        <span className="hero-subtitle">ELEVE SU ESTILO DE VIDA</span>
                        CON LAS PROPIEDADES <br /> MÁS EXCLUSIVAS DE ANDALUCÍA
                    </h1>
                    <Link to="/catalog" className="btn btn-hero">EXPLORE NUESTRA COLECCIÓN EXCLUSIVA</Link>
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
