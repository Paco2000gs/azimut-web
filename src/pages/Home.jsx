import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProperties } from '../context/PropertiesContext';
import PropertyCard from '../components/PropertyCard';
import SEO from '../components/SEO';
import { Compass, Shield, Key } from 'lucide-react'; // Import icons matching the screenshot vibe
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
                description="Elevate your lifestyle with Andalusia's premier properties. Discover curated luxury residences in Marbella, Sotogrande, and beyond."
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "RealEstateAgent",
                        "name": "Azimut Property",
                        "url": "https://www.azimutproperty.com",
                        "logo": "https://www.azimutproperty.com/assets/azimut-logo-gold.png",
                        "image": "https://www.azimutproperty.com/assets/hero-bg.jpg",
                        "description": "Exclusive luxury real estate agency in Andalusia, Spain.",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Sevilla",
                            "addressRegion": "Andalusia",
                            "addressCountry": "ES"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+34-600-000-000",
                            "contactType": "customer service",
                            "areaServed": "ES",
                            "availableLanguage": ["English", "Spanish"]
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
                        <span className="hero-subtitle">ELEVATE YOUR LIFESTYLE</span>
                        WITH ANDALUSIA'S <br /> PREMIER PROPERTIES
                    </h1>
                    <Link to="/catalog" className="btn btn-hero">EXPLORE OUR EXCLUSIVE COLLECTION</Link>
                </div>
            </section>

            {/* Featured Properties containing "Curated Luxury Residences" */}
            <section className="section featured-section">
                <div className="container">
                    <div className="section-header decorative-header">
                        <h2>CURATED LUXURY RESIDENCES</h2>
                    </div>

                    {loading ? (
                        <div className="loading">Loading exclusive listings...</div>
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

            {/* Why Choose Section (Dark Background) */}
            <section className="section why-choose-section">
                <div className="container">
                    <div className="section-header">
                        <h2>WHY CHOOSE AZIMUT PROPERTY</h2>
                    </div>
                    <div className="value-grid">
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Compass size={40} strokeWidth={1} />
                            </div>
                            <h3>UNPARALLELED EXPERTISE</h3>
                            <p>Refined, trustworthy discernment across specific exclusive locations.</p>
                        </div>
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Shield size={40} strokeWidth={1} />
                            </div>
                            <h3>CONFIDENTIAL SERVICE</h3>
                            <p>Confidential service is considered to and paramount excellence.</p>
                        </div>
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Key size={40} strokeWidth={1} />
                            </div>
                            <h3>ACCESS TO OFF-MARKET GEMS</h3>
                            <p>Access to off-market gems, and the considerations promos.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
