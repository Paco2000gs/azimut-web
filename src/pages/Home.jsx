import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import { useBlog } from '../context/BlogContext';
import { generateBlogSlug } from '../utils/slugify';
import PropertyCard from '../components/PropertyCard';
import SEO from '../components/SEO';
import LeadMagnet from '../components/LeadMagnet';
import { Compass, Shield, Key } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
    const { properties, loading } = useProperties();
    const { posts } = useBlog();
    // Get 3 properties for the featured section
    const featuredProperties = properties.slice(0, 3);
    // Latest journal articles — surfaces internal links to blog posts from the
    // home page so Google can discover and crawl them (they were previously only
    // linked from /blog).
    const latestPosts = (posts || []).slice(0, 3);

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
        "description": "Boutique real estate agency specialized in luxury assets and rural estates across Andalusia. Specialists in Marbella, Cádiz, Sevilla, and Huelva.",
        "url": "https://www.azimutproperty.com/",
        "email": "info@azimutproperty.com",
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
            { "@type": "State", "name": "Andalusia", "sameAs": "https://www.wikidata.org/wiki/Q5771" },
            { "@type": "City", "name": "Marbella", "sameAs": "https://www.wikidata.org/wiki/Q39347" },
            { "@type": "City", "name": "Sevilla", "sameAs": "https://www.wikidata.org/wiki/Q8717" },
            { "@type": "City", "name": "Cádiz", "sameAs": "https://www.wikidata.org/wiki/Q15682" },
            { "@type": "City", "name": "Huelva", "sameAs": "https://www.wikidata.org/wiki/Q12246" },
            { "@type": "Place", "name": "Costa del Sol" }
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
                title="Casas Rurales y Chalets en Cádiz, Huelva y Sevilla | Azimut Property"
                description="Descubre casas rurales, chalets y fincas en Cádiz, Huelva y Sevilla. Propiedades únicas con terreno, piscina y carácter rural. Asesoría personalizada."
                url="/"
                keywords="casa rural Cádiz, chalet Huelva, finca Sevilla, propiedad rural Andalucía, chalet con terreno, comprar casa campo, cortijo Sevilla, hacienda Cádiz"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(schemaData)}
                </script>
            </Helmet>

            {/* Hero Section */}
            <section className="hero">
                <picture className="hero-media">
                    <source
                        type="image/webp"
                        srcSet="/media/hero-estate-960.webp 960w, /media/hero-estate-1440.webp 1440w, /media/hero-estate-1920.webp 1920w"
                        sizes="100vw"
                    />
                    <img
                        src="/media/hero-estate-1440.jpg"
                        srcSet="/media/hero-estate-960.jpg 960w, /media/hero-estate-1440.jpg 1440w, /media/hero-estate-1920.jpg 1920w"
                        sizes="100vw"
                        alt="Olive terraces at sunset on a historic estate in the Andalusian interior"
                        fetchPriority="high"
                        decoding="async"
                        width="1920"
                        height="1080"
                    />
                </picture>
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <header className="hero-header-branded">
                        <h1 className="hero-title">
                            <span className="hero-title-lead">Elevate your portfolio</span>
                            with the most unique <br /> properties in Southern Spain
                        </h1>
                        <p className="main-value-proposition">
                            Exclusive estates and investment opportunities in Andalusia — from
                            contemporary villas in the Golden Triangle to historic cortijos and
                            high-yield agricultural land in Cádiz and Sevilla.
                        </p>
                    </header>

                    <div className="cta-group-luxury">
                        <Link to="/venta" className="btn btn-hero btn-primary-gold">View Property Portfolio</Link>
                        <Link to="/venta?type=finca" className="btn btn-hero btn-secondary-outline">Explore Rural Estates</Link>
                    </div>

                    <div className="trust-indicators">
                        <span>Discreet Representation</span>
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
                            Specialists in premium real estate assets across Andalusia.
                            Azimut Property provides expert consultancy for luxury residences, 
                            rural estates, and strategic land investments.
                        </p>
                        <p>
                            While our roots are deep in the Golden Triangle of Marbella, Benahavís, and Estepona, 
                            we have expanded our expertise to the emerging high-value markets of Cádiz and Sevilla. 
                            From historic haciendas with productive olive groves to coastal plots with 
                            unparalleled development potential, we identify assets that offer both 
                            lifestyle excellence and long-term capital preservation.
                        </p>
                        <p>
                            In a competitive landscape, off-market access is what separates a
                            secured acquisition from a missed one. We work quietly, for a limited
                            number of clients, to reach the most coveted opportunities in Southern
                            Europe before they are ever advertised.
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
                        <Link to="/venta" className="btn btn-gold">VIEW ALL PROPERTIES</Link>
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

            {/* From the Journal — internal links to latest blog articles */}
            {latestPosts.length > 0 && (
                <section className="section journal-preview-section">
                    <div className="container">
                        <div className="section-header decorative-header">
                            <h2>FROM THE JOURNAL</h2>
                        </div>
                        <div className="journal-grid">
                            {latestPosts.map(post => (
                                <Link
                                    key={post.id}
                                    to={`/blog/${generateBlogSlug(post)}`}
                                    className="journal-card"
                                >
                                    {post.image && (
                                        <div className="journal-card-media">
                                            <img src={post.image} alt="" loading="lazy" />
                                        </div>
                                    )}
                                    <div className="journal-card-body">
                                        <h3>{post.title}</h3>
                                        {post.excerpt && (
                                            <p>
                                                {post.excerpt.length > 120 ? post.excerpt.substring(0, 120) + '…' : post.excerpt}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="view-all-container">
                            <Link to="/blog" className="btn btn-gold">READ THE JOURNAL</Link>
                        </div>
                    </div>
                </section>
            )}

            <LeadMagnet />
        </div>
    );
};

export default Home;
