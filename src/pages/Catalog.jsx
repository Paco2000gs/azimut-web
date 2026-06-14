import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import PropertyCard from '../components/PropertyCard';
import PropertyCardWide from '../components/PropertyCardWide';
import SEO from '../components/SEO';
import '../styles/Catalog.css';

import { PROVINCES, CITIES, PROPERTY_TYPES } from '../constants/propertyOptions';
import { generatePropertyPath } from '../utils/slugify';
import LocationSEOContent from '../components/LocationSEOContent';
import LeadMagnet from '../components/LeadMagnet';

// Slugify a city name to match URL params (e.g., "Jimena de la Frontera" -> "jimena-de-la-frontera")
const slugifyCity = (s) => s.toLowerCase().normalize('NFD')
    .replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const Catalog = () => {
    const { city: urlCity, area: urlArea } = useParams();
    const [searchParams] = useSearchParams();
    const { properties, loading } = useProperties();

    // Helper to format URL slugs back to display names (e.g., "marbella" -> "Marbella")
    const formatSlug = (slug) => {
        if (!slug) return '';
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Map URL slugs that represent provinces to their province name
    const PROVINCE_SLUGS = {
        'cadiz': 'Cádiz',
        'huelva': 'Huelva',
        'sevilla': 'Sevilla',
        'malaga': 'Málaga',
        'badajoz': 'Badajoz',
        'almeria': 'Almería',
        'granada': 'Granada',
        'girona': 'Girona',
        'cuenca': 'Cuenca',
    };

    // Reverse lookup: city slug -> its real province. Without this, city pages
    // defaulted to 'Málaga' and the province filter hid every non-Málaga listing
    // (Jimena, Sotogrande, Sanlúcar, Constantina, Olivenza, Almonte...).
    const CITY_TO_PROVINCE = useMemo(() => {
        const map = {};
        for (const [prov, cities] of Object.entries(CITIES)) {
            for (const c of cities) map[slugifyCity(c)] = prov;
        }
        return map;
    }, []);

    const isProvincePage = urlCity ? !!PROVINCE_SLUGS[urlCity.toLowerCase()] : false;
    const detectedProvince = urlCity
        ? (PROVINCE_SLUGS[urlCity.toLowerCase()] || CITY_TO_PROVINCE[slugifyCity(urlCity)] || '')
        : '';

    // Filter states - Priority to URL parameters for Silo Architecture
    const [province, setProvince] = useState(urlCity ? detectedProvince : (searchParams.get('province') || ''));
    const [city, setCity] = useState(urlCity && !isProvincePage ? formatSlug(urlCity) : (searchParams.get('city') || ''));
    const [type, setType] = useState(searchParams.get('type') || '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Update state if URL parameters change (for direct navigation/back-forward)
    useEffect(() => {
        if (urlCity) {
            setProvince(detectedProvince);
            setCity(isProvincePage ? '' : formatSlug(urlCity));
        }
        if (urlArea) {
            // Check if urlArea is a property type (e.g., /venta/cadiz/finca)
            const typeMatch = PROPERTY_TYPES.find(t => t.toLowerCase().replace(/\s+/g, '-') === urlArea.toLowerCase());
            if (typeMatch) {
                setType(typeMatch);
            }
        } else {
            // Reset type if we navigate back to a province-only URL
            if (!searchParams.get('type')) {
                setType('');
            }
        }
    }, [urlCity, urlArea, searchParams]);

    // Handle province change
    const handleProvinceChange = (e) => {
        setProvince(e.target.value);
        setCity(''); // Reset city when province changes
    };

    // Compute available cities based on current properties and selected province
    const availableCities = useMemo(() => {
        if (!properties || properties.length === 0 || !province) return [];

        const citySet = new Set(
            properties
                .filter(p => p.province === province)
                .map(p => p.city)
        );

        const allProvinceCities = CITIES[province] || [];
        return allProvinceCities.filter(c => citySet.has(c));
    }, [properties, province]);

    // Filter logic for available types
    const availableTypes = useMemo(() => {
        if (!properties || properties.length === 0) return PROPERTY_TYPES;

        let filtered = properties;
        if (province) filtered = filtered.filter(p => p.province === province);
        if (city) filtered = filtered.filter(p => p.city?.toLowerCase() === city?.toLowerCase());

        const typeSet = new Set(filtered.map(p => p.type));
        return PROPERTY_TYPES.filter(t => typeSet.has(t));
    }, [properties, province, city]);

    const filteredProperties = useMemo(() => {
        if (loading) return [];
        return properties.filter(property => {
            const matchProvince = province ? property.province === province : true;
            // Case insensitive match for city
            const matchCity = city ? property.city?.toLowerCase() === city?.toLowerCase() : true;
            const matchType = type ? property.type.toLowerCase() === type.toLowerCase() : true;
            // Exclude Price on Demand properties from price filtering if a filter is set
            const matchMinPrice = minPrice ? (!property.price_on_demand && property.price >= parseInt(minPrice)) : true;
            const matchMaxPrice = maxPrice ? (!property.price_on_demand && property.price <= parseInt(maxPrice)) : true;

            return matchProvince && matchCity && matchType && matchMinPrice && matchMaxPrice;
        });
    }, [properties, loading, province, city, type, minPrice, maxPrice]);

    // Per-province SEO data for rural Andalusia focus
    const PROVINCE_SEO = {
        'cadiz': {
            title: 'Casas Rurales y Chalets en Cádiz | Azimut Property',
            description: 'Encuentra tu casa rural en Cádiz: chalets, fincas y cortijos con piscina y terreno. Propiedades únicas en la campiña gaditana.',
            keywords: 'casa rural Cádiz, chalet Cádiz, finca Cádiz, cortijo Cádiz',
            h1: 'Casas Rurales y Fincas en Venta en Cádiz',
            hero: 'Encuentra tu propiedad rural en la provincia más auténtica de Andalucía',
        },
        'huelva': {
            title: 'Chalets y Fincas en Huelva | Azimut Property',
            description: 'Propiedades rurales en Huelva: chalets con terreno, fincas agrícolas y casas de campo. Inversión segura en el campo onubense.',
            keywords: 'chalet Huelva, finca Huelva, casa rural Huelva, propiedad rural Huelva',
            h1: 'Fincas y Chalets con Terreno en Venta en Huelva',
            hero: 'Propiedades rurales únicas entre el Parque Nacional de Doñana y la Sierra de Aracena',
        },
        'sevilla': {
            title: 'Fincas y Cortijos en Sevilla | Azimut Property',
            description: 'Fincas, cortijos y haciendas en Sevilla. Propiedades con olivar, piscina y encanto rural a 35 min de Sevilla capital.',
            keywords: 'finca Sevilla, cortijo Sevilla, hacienda Sevilla, casa rural Sevilla',
            h1: 'Cortijos, Haciendas y Fincas en Venta en Sevilla',
            hero: 'Adquiere una hacienda, cortijo u olivar en la provincia sevillana',
        },
        'malaga': {
            title: 'Fincas, Terrenos y Cortijos en Málaga | Azimut Property',
            description: 'Inversión en fincas rústicas, terrenos agrícolas y propiedades rurales en el interior de Málaga. Oportunidades en Ronda, Axarquía y Valle del Guadalhorce.',
            keywords: 'fincas Málaga, terrenos agrícolas Málaga, comprar cortijo Ronda, inversión suelo Málaga, casa de campo Málaga interior, finca olivar Málaga',
            h1: 'Fincas y Terrenos en Venta en Málaga Interior',
            hero: 'Descubre el potencial de inversión en el interior de la provincia de Málaga',
        },
    };

    const provinceSeo = urlCity ? PROVINCE_SEO[urlCity.toLowerCase()] : null;

    // Dynamic SEO data
    const seoTitle = useMemo(() => {
        if (provinceSeo) return provinceSeo.title;
        if (city) return `Luxury Real Estate & Villas for Sale in ${city}`;
        if (type) return `Exclusive ${type}s for Sale in Andalusia`;
        return "Property Catalogue | Luxury Real Estate";
    }, [city, type, provinceSeo]);

    const seoDescription = useMemo(() => {
        if (provinceSeo) return provinceSeo.description;
        if (city) return `Discover the most exclusive luxury properties for sale in ${city}. High-end villas, apartments, and off-market listings in ${city}, Costa del Sol.`;
        return "Explore our exclusive collection of luxury villas, apartments, and estates in the most prestigious locations in Andalusia.";
    }, [city, provinceSeo]);

    const seoKeywords = useMemo(() => {
        if (provinceSeo) return provinceSeo.keywords;
        if (city) return `properties ${city}, villas ${city}, luxury real estate ${city}, Costa del Sol`;
        return "luxury properties Costa del Sol, villas Marbella, apartments Estepona, real estate Andalusia";
    }, [city, provinceSeo]);

    const breadcrumbSchema = useMemo(() => {
        const provinceName = urlCity ? (PROVINCE_SEO[urlCity.toLowerCase()]?.h1 || `Propiedades en ${formatSlug(urlCity)}`) : null;
        const items = [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Propiedades en Venta", "item": "https://www.azimutproperty.com/venta" }
        ];
        if (urlCity) {
            items.push({
                "@type": "ListItem",
                "position": 3,
                "name": provinceName,
                "item": `https://www.azimutproperty.com/venta/${urlCity}`
            });
        }
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items
        };
    }, [urlCity]);

    // ItemList schema for province pages (helps Google index individual property links)
    const itemListSchema = useMemo(() => {
        if (!provinceSeo || filteredProperties.length === 0) return null;
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": provinceSeo.h1,
            "description": provinceSeo.description,
            "url": `https://www.azimutproperty.com/venta/${urlCity}`,
            "numberOfItems": filteredProperties.length,
            "itemListElement": filteredProperties.slice(0, 10).map((prop, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": `https://www.azimutproperty.com${generatePropertyPath(prop)}`,
                "name": prop.title
            }))
        };
    }, [provinceSeo, filteredProperties, urlCity]);

    return (
        <div className="page catalog">
            <SEO
                title={seoTitle}
                description={seoDescription}
                url={urlCity ? `/venta/${urlCity}${urlArea ? `/${urlArea}` : ''}` : "/venta"}
                keywords={seoKeywords}
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
                {itemListSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(itemListSchema)}
                    </script>
                )}
            </Helmet>

            {/* Hero / Header Section */}
            <div className="catalog-header">
                <div className="container">
                    <h1>{provinceSeo ? provinceSeo.h1 : city ? `Propiedades en Venta en ${city}` : 'Catálogo de Propiedades'}</h1>
                    <p>{provinceSeo ? provinceSeo.hero : city ? `Descubre propiedades exclusivas en ${city}` : 'Descubre tu próxima residencia de ensueño'}</p>
                </div>
            </div>

            {/* Breadcrumbs UI */}
            <div className="container" style={{ marginTop: '1.5rem' }}>
                <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <li><a href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Inicio</a></li>
                        <li style={{ color: '#cbd5e1' }}>/</li>
                        <li><a href="/venta" style={{ color: '#64748b', textDecoration: 'none' }}>Propiedades</a></li>
                        {urlCity && (
                            <>
                                <li style={{ color: '#cbd5e1' }}>/</li>
                                <li>
                                    <a href={`/venta/${urlCity}`} style={{ color: type ? '#64748b' : '#1e293b', fontWeight: type ? '400' : '600', textDecoration: 'none' }}>
                                        {formatSlug(urlCity)}
                                    </a>
                                </li>
                            </>
                        )}
                        {type && (
                            <>
                                <li style={{ color: '#cbd5e1' }}>/</li>
                                <li style={{ color: '#1e293b', fontWeight: '600' }}>{type}s</li>
                            </>
                        )}
                    </ol>
                </nav>
            </div>

            {/* Search Bar Section */}
            <div className="search-bar-container">
                <div className="container">
                    <div className="search-filters">
                        <div className="filter-item">
                            <label>Province</label>
                            <select value={province} onChange={handleProvinceChange} className="filter-select">
                                <option value="">All</option>
                                {PROVINCES.map(prov => (
                                    <option key={prov} value={prov}>{prov}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>City / Area</label>
                            <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!province} className="filter-select">
                                <option value="">
                                    {!province
                                        ? "Select Province"
                                        : availableCities.length === 0
                                            ? "No properties"
                                            : "All cities"}
                                </option>
                                {availableCities.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} className="filter-select">
                                <option value="">All</option>
                                {availableTypes.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-item">
                            <label>Min Price (€)</label>
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-item">
                            <label>Max Price (€)</label>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="filter-input"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '3rem', paddingBottom: '4rem' }}>
                {/* Results Count */}
                <div className="results-header" style={{ marginBottom: '2rem', color: '#64748b' }}>
                    {loading ? (
                        <span>Searching...</span>
                    ) : (
                        <span>Showing {filteredProperties.length} exclusive properties</span>
                    )}
                </div>

                {/* Property Grid (Single Column for Wide Cards) */}
                <div className="property-list-wide">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <h2>Loading properties...</h2>
                        </div>
                    ) : filteredProperties.length > 0 ? (
                        <div className="wide-grid">
                            {filteredProperties.map((property, index) => (
                                <PropertyCardWide
                                    key={property.id}
                                    property={property}
                                    priority={index < 3}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="no-results">
                            <h3>No properties found with these criteria.</h3>
                            <button
                                onClick={() => {
                                    setProvince('');
                                    setCity('');
                                    setType('');
                                    setMinPrice('');
                                    setMaxPrice('');
                                }}
                                className="btn-reset"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <LeadMagnet />

            {!loading && <LocationSEOContent city={city || urlCity} area={urlArea} />}
        </div>
    );
};

export default Catalog;
