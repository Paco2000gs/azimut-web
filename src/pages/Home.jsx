import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import { useBlog } from '../context/BlogContext';
import { generateBlogSlug } from '../utils/slugify';
import { detectLang } from '../utils/detectLang';
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
    //
    // English articles lead, because everything else on this page reads in English
    // and two of the three most recent articles were Spanish: an international
    // buyer met a Journal he could not read. Spanish articles still fill the block
    // if there are fewer than three English ones, and every article keeps its crawl
    // path through /blog and the sitemap.
    const allPosts = posts || [];
    const englishPosts = allPosts.filter(p => detectLang(`${p.title} ${p.excerpt || ''}`) === 'en');
    const otherPosts = allPosts.filter(p => !englishPosts.includes(p));
    const latestPosts = [...englishPosts, ...otherPosts].slice(0, 3);

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
            {/* Metadata must match the page's real language. The home is Spanish
                (the site's primary language, where the search demand is), so the
                title, description and keywords are Spanish and lang is "es". The
                English versions of the collections are reached through their own
                paired URLs with hreflang. */}
            <SEO
                title="Fincas y villas de lujo fuera de mercado en Marbella, Sotogrande y Andalucía | Azimut Property"
                description="Villas en el Golden Triangle de Marbella, mansiones en Sotogrande, haciendas históricas y fincas ecuestres en Cádiz y Sevilla. Asesoramiento discreto para compradores internacionales."
                url="/"
                lang="es"
                keywords="fincas de lujo fuera de mercado Andalucía, villas de lujo Marbella Golden Triangle, mansión en venta Sotogrande, hacienda histórica en venta España, finca ecuestre Jimena de la Frontera, finca de olivar en venta Andalucía, finca rústica en venta Cádiz Sevilla, Azimut Property"
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
                        fetchpriority="high"
                        decoding="async"
                        width="1920"
                        height="1080"
                    />
                </picture>
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <header className="hero-header-branded">
                        <h1 className="hero-title">
                            {/* The space is explicit: JSX drops whitespace that spans a line
                                break, which silently welded "portfolio" to "with". */}
                            <span className="hero-title-lead">Eleve su patrimonio</span>{' '}
                            con los inmuebles más singulares <br />del sur de España
                        </h1>
                        <p className="main-value-proposition">
                            Fincas y oportunidades de inversión exclusivas en Andalucía: desde
                            villas contemporáneas en el Golden Triangle hasta cortijos históricos
                            y tierra agrícola de alto rendimiento en Cádiz y Sevilla.
                        </p>
                    </header>

                    <div className="cta-group-luxury">
                        <Link to="/venta" className="btn btn-hero btn-primary-gold">Ver el catálogo</Link>
                        <Link to="/venta?type=finca" className="btn btn-hero btn-secondary-outline">Explorar fincas rústicas</Link>
                    </div>

                    <div className="trust-indicators">
                        <span>Representación discreta</span>
                        <span className="separator">•</span>
                        <span>Red internacional de primer nivel</span>
                    </div>
                </div>
            </section>

            {/* Authority Text Section */}
            <section className="section authority-section">
                <div className="container authority-grid">
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
                    <div className="authority-media">
                        <picture>
                            <source
                                type="image/webp"
                                srcSet="/media/authority-polo-estate-560.webp 560w, /media/authority-polo-estate-1000.webp 1000w"
                                sizes="(max-width: 768px) 100vw, 480px"
                            />
                            <img
                                src="/media/authority-polo-estate-1000.jpg"
                                srcSet="/media/authority-polo-estate-560.jpg 560w, /media/authority-polo-estate-1000.jpg 1000w"
                                sizes="(max-width: 768px) 100vw, 480px"
                                alt="Campo de polo de la finca ecuestre de Jimena de la Frontera"
                                width="1000"
                                height="1250"
                                loading="lazy"
                                decoding="async"
                            />
                        </picture>
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
                        <div className="loading" role="status" aria-label="Cargando inmuebles">Cargando inmuebles exclusivos...</div>
                    ) : (
                        <div className="featured-grid">
                            {featuredProperties.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}

                    <div className="view-all-container">
                        <Link to="/venta" className="btn btn-gold">VER TODOS LOS INMUEBLES</Link>
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
                            <h3>EXPERIENCIA PROFUNDA</h3>
                            <p>Conocimiento detallado del mercado de lujo en las zonas más exclusivas de Andalucía.</p>
                        </div>
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Shield size={40} strokeWidth={1} aria-hidden="true" />
                            </div>
                            <h3>SERVICIO CONFIDENCIAL</h3>
                            <p>Total discreción y confidencialidad en cada operación. Su privacidad es nuestra prioridad.</p>
                        </div>
                        <div className="value-item">
                            <div className="icon-wrapper">
                                <Key size={40} strokeWidth={1} aria-hidden="true" />
                            </div>
                            <h3>ACCESO A INMUEBLES EXCLUSIVOS</h3>
                            <p>Acceso privilegiado a propiedades fuera de mercado y oportunidades únicas antes de su publicación.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* From the Journal — internal links to latest blog articles */}
            {latestPosts.length > 0 && (
                <section className="section journal-preview-section">
                    <div className="container">
                        <div className="section-header decorative-header">
                            <h2>DEL BLOG</h2>
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
                                            <img src={getOptimizedImageUrl(post.image, { width: 400 })} alt="" loading="lazy" decoding="async" />
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
                            <Link to="/blog" className="btn btn-gold">LEER EL BLOG</Link>
                        </div>
                    </div>
                </section>
            )}

            <LeadMagnet />
        </div>
    );
};

export default Home;
