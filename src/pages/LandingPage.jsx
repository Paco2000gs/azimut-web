import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import PropertyCard from '../components/PropertyCard';
import SEO from '../components/SEO';
import NotFound from './NotFound';
import '../styles/Home.css';

/**
 * Zone × typology landing pages (SEO audit, priority #2).
 *
 * Each entry is a curated marketing page at a clean, keyword-first URL that
 * targets the English luxury searches the audit identified — the exact niche
 * our competitors (Panorama, Sotheby's) win with a landing-per-zone pattern and
 * that our Spanish /venta silos do not reach. Content is English with lang="en"
 * to match the real product and the international buyer; each page carries its
 * own title and unique prose, and pulls in whatever live listings match its
 * zone and type. The Spanish province pages under /venta keep serving Spanish
 * rural searches — different audience, different URL, no cannibalisation.
 *
 * `match` runs over the live portfolio, so a page shows real cards when we hold
 * stock and falls back to prose + CTA when we do not. `listingsHref` points at
 * the closest existing catalogue page for a deeper browse.
 */
const text = (p) => `${p.type || ''} ${p.city || ''} ${p.province || ''} ${p.location || ''} ${p.title || ''}`.toLowerCase();
const isVilla = (p) => (p.type || '').toLowerCase().includes('villa');

const LANDINGS = {
    'villas-marbella': {
        eyebrow: 'Golden Triangle',
        h1: 'Luxury Villas in Marbella & the Golden Triangle',
        subhead: 'Contemporary and frontline-golf villas in Marbella, Benahavís and Estepona — many available off-market.',
        heroAlt: 'Contemporary luxury villa with pool overlooking the Marbella coastline at dusk',
        seoTitle: 'Luxury Villas for Sale in Marbella & the Golden Triangle | Azimut Property',
        seoDescription: 'Luxury villas for sale in Marbella, Benahavís and Estepona — the Golden Triangle. Contemporary, frontline-golf and sea-view villas, many off-market, for international buyers.',
        keywords: 'luxury villas Marbella, villas for sale Golden Triangle, Marbella Golden Mile villas, contemporary villas Benahavís, sea view villa Estepona, off-market villas Marbella',
        intro: [
            'Marbella and the wider Golden Triangle — Benahavís and Estepona — remain the most established address for luxury villas on the Costa del Sol. From frontline-golf residences in Nueva Andalucía and La Zagaleta to contemporary sea-view villas on the Golden Mile and Sierra Blanca, this is where design, security and long-term capital preservation meet.',
            'Azimut Property curates a select portfolio of villas across the Triangle, with privileged access to off-market listings that never reach the public portals. Whether you are buying a primary residence, a holiday home or a long-term investment, we advise international buyers end to end — from the first private viewing to due diligence and the notary.',
            'Villa buyers here prioritise privacy, panoramic views and proximity to Puerto Banús and the international schools. We match each brief to the right micro-location and move discreetly, so the most coveted properties are secured before they are ever advertised.',
        ],
        highlights: [
            { h: 'Golden Triangle focus', p: 'Marbella, Benahavís and Estepona — the Golden Mile, Sierra Blanca, Nueva Andalucía and La Zagaleta.' },
            { h: 'Off-market access', p: 'Villas held quietly by owners who never list on the public portals.' },
            { h: 'End-to-end advice', p: 'Private viewings, due diligence, NIE and the notary for international buyers.' },
        ],
        listingsHref: '/venta/marbella/villa',
        listingsCta: 'Browse Marbella villas',
        match: (p) => isVilla(p) && /(marbella|benahav|estepona|nueva andaluc|sierra blanca|golden mile)/.test(text(p)),
    },

    'mansions-sotogrande': {
        eyebrow: 'Sotogrande',
        h1: 'Mansions & Villas for Sale in Sotogrande',
        subhead: "Golf, polo and marina living in southern Europe's most private resort — including off-market estates.",
        heroAlt: 'Elegant mansion with mature gardens and a private pool in Sotogrande, Cádiz',
        seoTitle: 'Mansions for Sale in Sotogrande — Golf & Marina Villas | Azimut Property',
        seoDescription: 'Mansions and luxury villas for sale in Sotogrande, San Roque (Cádiz). Golf, polo and marina living from €1M to €15M, including off-market estates, for international buyers.',
        keywords: 'mansion for sale Sotogrande, luxury villas Sotogrande, off-market properties Sotogrande, Sotogrande Alto villa, Valderrama golf property, San Roque luxury real estate',
        intro: [
            "Sotogrande, in the Cádiz municipality of San Roque, is one of southern Europe's most private luxury enclaves — a resort of championship golf, international polo and a deep-water marina. Sotogrande Alto, with its large plots, mature gardens and views over the Valderrama course, is the address of choice for families who value discretion above all.",
            'Azimut Property represents buyers seeking mansions and villas in Sotogrande, from €1M residences to €15M estates. Our access extends to off-market properties held quietly by owners who do not advertise, and our team guides international purchasers through every step — NIE, due diligence, the notary and tax advice.',
            'Beyond the golf and polo, Sotogrande offers the International School of Sotogrande, marina restaurants and 25-minute access to Gibraltar airport — the blend of sport, education and privacy that sustains demand and long-term value.',
        ],
        highlights: [
            { h: 'Sotogrande Alto', p: 'Large plots, mature gardens and views over Valderrama and the lake.' },
            { h: '€1M–€15M', p: 'From family villas to landmark estates, on and off market.' },
            { h: 'Sport & schooling', p: 'Golf, polo, marina and the International School of Sotogrande.' },
        ],
        listingsHref: '/venta/sotogrande',
        listingsCta: 'Browse Sotogrande properties',
        match: (p) => /sotogrande/.test(text(p)),
    },

    'equestrian-estates-jimena-de-la-frontera': {
        eyebrow: 'Campo de Gibraltar',
        h1: 'Equestrian Estates in Jimena de la Frontera',
        subhead: 'Polo fields, professional stabling and protected dehesa — 30 minutes from Sotogrande.',
        heroAlt: 'Equestrian estate with paddocks and cork-oak dehesa in Jimena de la Frontera, Cádiz',
        seoTitle: 'Equestrian Estates for Sale in Jimena de la Frontera | Azimut Property',
        seoDescription: 'Equestrian estates for sale in Jimena de la Frontera, Cádiz — polo fields, professional stabling and cork-oak dehesa, 30 minutes from Sotogrande. Off-market access for international buyers.',
        keywords: 'equestrian estate Jimena de la Frontera, polo estate for sale Cádiz, finca ecuestre Jimena, off-market equestrian estate near Sotogrande, horse property Andalusia, dehesa estate Cádiz',
        intro: [
            'Jimena de la Frontera, at the heart of the Alcornocales Natural Park in Cádiz, is one of Andalusia’s finest addresses for equestrian estates. Thirty minutes from Sotogrande’s polo and golf, it offers the space, privacy and protected landscape the resort itself cannot — cork-oak dehesa, clean rivers and large parcels from ten to more than five hundred hectares.',
            'The most sought-after estates combine regulation polo fields, professional stabling and paddocks with a luxury main residence — ideal for professional riders or as an equestrian-tourism investment. Azimut Property offers off-market access to these properties, prized by international buyers from the UK, Scandinavia and the Middle East.',
            'We advise on the full acquisition — rural and urban due diligence, water and cork rights, NIE and the notary. It is a niche few agencies cover with real depth, and one we know property by property.',
        ],
        highlights: [
            { h: 'Polo & stabling', p: 'Regulation polo fields, professional stables and paddocks.' },
            { h: 'Next to Sotogrande', p: 'The privacy of the interior, 30 minutes from resort services.' },
            { h: 'Protected dehesa', p: 'Cork-oak estates inside the Alcornocales Natural Park.' },
        ],
        listingsHref: '/venta/jimena-de-la-frontera',
        listingsCta: 'Browse Jimena estates',
        match: (p) => /(jimena|equestrian|ecuestre|equine|\bpolo\b)/.test(text(p)),
    },

    'olive-estates-sevilla': {
        eyebrow: 'Campiña Sevillana',
        h1: 'Olive-Grove Estates & Haciendas in Seville',
        subhead: 'Historic haciendas and productive olive estates across Carmona, Écija, Osuna and the Aljarafe.',
        heroAlt: 'Historic hacienda among centuries-old olive groves in the Seville countryside at sunset',
        seoTitle: 'Olive-Grove Estates & Historic Haciendas for Sale in Seville | Azimut Property',
        seoDescription: 'Olive-grove estates and historic haciendas for sale in Seville — Carmona, Écija, Osuna and the Aljarafe. Productive, organic and off-market estates for international investors.',
        keywords: 'olive grove estate for sale Andalusia, historic hacienda for sale Seville, cortijo de olivar Sevilla, olive estate investment Andalusia, organic olive farm Spain, hacienda for hotel Seville',
        intro: [
            'The province of Seville holds the largest area of productive olive groves in Spain — more than 300,000 hectares of extra-virgin olive oil. For international buyers, an olive-grove estate here is both a lifestyle and a working asset: a historic hacienda or cortijo among centuries-old groves, with a gross agricultural yield of 3–5% on land value and strong long-term capital preservation.',
            'Demand for organic, certified estates has surged, led by European buyers seeking their own EVOO production. Azimut Property sources cortijos, historic haciendas and olive estates across Carmona, Écija, Osuna and the Aljarafe — including off-market properties with rehabilitation potential for boutique-hotel or private use.',
            'We guide the full purchase — agronomic and legal due diligence, organic-conversion status, NIE and the notary — so investors can acquire a Seville olive estate with confidence.',
        ],
        highlights: [
            { h: 'Working olive asset', p: 'Productive groves with a 3–5% gross yield on land value.' },
            { h: 'Historic haciendas', p: 'Carmona, Écija, Osuna and the Aljarafe — many with hotel potential.' },
            { h: 'Organic premium', p: 'Certified estates commanding a premium with European buyers.' },
        ],
        listingsHref: '/venta/sevilla',
        listingsCta: 'Browse Seville estates',
        match: (p) => /(sevilla|seville)/.test(text(p)) && /(finca|cortijo|hacienda|olive|olivar|estate)/.test(text(p)),
    },
};

const SITE_URL = 'https://www.azimutproperty.com';

const LandingPage = ({ slug }) => {
    const cfg = LANDINGS[slug];
    const { properties, loading } = useProperties();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    // Up to three live listings that match this collection. Runs on the seeded
    // portfolio so the cards are present in the prerendered HTML, not only after
    // hydration.
    const matches = useMemo(() => {
        if (!cfg || loading || !properties?.length) return [];
        return properties.filter(cfg.match).slice(0, 3);
    }, [cfg, properties, loading]);

    // Routes are registered per known slug, so this is defensive only.
    if (!cfg) return <NotFound />;

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: cfg.h1, item: `${SITE_URL}/${slug}` },
        ],
    };

    return (
        <div className="page home">
            <SEO
                title={cfg.seoTitle}
                description={cfg.seoDescription}
                url={`/${slug}`}
                lang="en"
                keywords={cfg.keywords}
            />
            <Helmet>
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>

            {/* Hero */}
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
                        alt={cfg.heroAlt}
                        fetchpriority="high"
                        decoding="async"
                        width="1920"
                        height="1080"
                    />
                </picture>
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <header className="hero-header-branded">
                        <p className="landing-eyebrow" style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '0.8rem', marginBottom: '1rem', opacity: 0.9 }}>{cfg.eyebrow}</p>
                        <h1 className="hero-title">{cfg.h1}</h1>
                        <p className="main-value-proposition">{cfg.subhead}</p>
                    </header>

                    <div className="cta-group-luxury">
                        <Link to="/contact" className="btn btn-hero btn-primary-gold">Arrange a Private Consultation</Link>
                        <Link to={cfg.listingsHref} className="btn btn-hero btn-secondary-outline">{cfg.listingsCta}</Link>
                    </div>

                    <div className="trust-indicators">
                        <span>Off-Market Access</span>
                        <span className="separator">•</span>
                        <span>Discreet Representation</span>
                    </div>
                </div>
            </section>

            {/* Intro prose */}
            <section className="section authority-section">
                <div className="container">
                    <div className="authority-content">
                        {cfg.intro.map((para, i) => (
                            i === 0
                                ? <p key={i} className="lead-text">{para}</p>
                                : <p key={i}>{para}</p>
                        ))}
                    </div>
                </div>
            </section>

            {/* Highlights */}
            <section className="section why-choose-section">
                <div className="container">
                    <div className="value-grid">
                        {cfg.highlights.map((item, i) => (
                            <div className="value-item" key={i}>
                                <h3>{item.h}</h3>
                                <p>{item.p}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Matching listings (only when we hold stock) */}
            {matches.length > 0 && (
                <section className="section featured-section">
                    <div className="container">
                        <div className="section-header decorative-header">
                            <h2>AVAILABLE NOW</h2>
                        </div>
                        <div className="featured-grid">
                            {matches.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                        <div className="view-all-container">
                            <Link to={cfg.listingsHref} className="btn btn-gold">{cfg.listingsCta.toUpperCase()}</Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default LandingPage;
