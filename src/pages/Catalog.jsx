import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import PropertyCard from '../components/PropertyCard';
import PropertyCardWide from '../components/PropertyCardWide';
import SEO from '../components/SEO';
import '../styles/Catalog.css';

import { PROVINCES, CITIES, PROPERTY_TYPES } from '../constants/propertyOptions';
import LocationSEOContent from '../components/LocationSEOContent';

const Catalog = () => {
    const { city: urlCity, area: urlArea } = useParams();
    const [searchParams] = useSearchParams();
    const { properties, loading } = useProperties();

    // Helper to format URL slugs back to display names (e.g., "marbella" -> "Marbella")
    const formatSlug = (slug) => {
        if (!slug) return '';
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Filter states - Priority to URL parameters for Silo Architecture
    const [province, setProvince] = useState(urlCity ? 'Málaga' : (searchParams.get('province') || ''));
    const [city, setCity] = useState(urlCity ? formatSlug(urlCity) : (searchParams.get('city') || ''));
    const [type, setType] = useState(searchParams.get('type') || '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Update state if URL parameters change (for direct navigation/back-forward)
    useEffect(() => {
        if (urlCity) {
            setProvince('Málaga');
            setCity(formatSlug(urlCity));
        }
        if (urlArea) {
            // If area is present, we might want to use it for filtering too
            // Note: Our current schema might not have an "area" field separate from city, 
            // or it might be part of the city for specific urbanizations.
        }
    }, [urlCity, urlArea]);

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

    // Dynamic SEO data
    const seoTitle = useMemo(() => {
        if (city) return `Luxury Real Estate & Villas for Sale in ${city}`;
        if (type) return `Exclusive ${type}s for Sale in Andalusia`;
        return "Property Catalogue | Luxury Real Estate";
    }, [city, type]);

    const seoDescription = useMemo(() => {
        if (city) return `Discover the most exclusive luxury properties for sale in ${city}. High-end villas, apartments, and off-market listings in ${city}, Costa del Sol.`;
        return "Explore our exclusive collection of luxury villas, apartments, and estates in the most prestigious locations in Andalusia.";
    }, [city]);

    const seoKeywords = useMemo(() => {
        if (city) return `properties ${city}, villas ${city}, luxury real estate ${city}, Costa del Sol`;
        return "luxury properties Costa del Sol, villas Marbella, apartments Estepona, real estate Andalusia";
    }, [city]);

    const breadcrumbSchema = useMemo(() => {
        const items = [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Properties for Sale", "item": "https://www.azimutproperty.com/venta" }
        ];
        if (urlCity) {
            items.push({
                "@type": "ListItem",
                "position": 3,
                "name": `Properties in ${formatSlug(urlCity)}`,
                "item": `https://www.azimutproperty.com/venta/${urlCity}`
            });
        }
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items
        };
    }, [urlCity]);

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
            </Helmet>

            {/* Hero / Header Section */}
            <div className="catalog-header">
                <div className="container">
                    <h1>Property Catalogue</h1>
                    <p>Discover your next dream residence</p>
                </div>
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

            {!loading && <LocationSEOContent city={city} area={urlArea} />}
        </div>
    );
};

export default Catalog;
