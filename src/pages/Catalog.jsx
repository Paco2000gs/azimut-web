import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProperties } from '../context/PropertiesContext';
import PropertyCard from '../components/PropertyCard';
import PropertyCardWide from '../components/PropertyCardWide';
import SEO from '../components/SEO';
import '../styles/Catalog.css';

import { PROVINCES, CITIES, PROPERTY_TYPES } from '../constants/propertyOptions';

const Catalog = () => {
    const [searchParams] = useSearchParams();
    const { properties, loading } = useProperties();

    // Filter states
    const [province, setProvince] = useState(searchParams.get('province') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');
    const [type, setType] = useState(searchParams.get('type') || '');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Handle province change
    const handleProvinceChange = (e) => {
        setProvince(e.target.value);
        setCity(''); // Reset city when province changes
    };

    // Compute available cities based on current properties and selected province
    const availableCities = useMemo(() => {
        if (!properties || properties.length === 0 || !province) return [];

        // Get all cities that appear in the properties list for the selected province
        const citySet = new Set(
            properties
                .filter(p => p.province === province)
                .map(p => p.city)
        );

        // Filter the static cities list to only include those present in the properties
        const allProvinceCities = CITIES[province] || [];
        // If we want to show ONLY available, we intersect. 
        // If we want to allow selecting any valid city, we use allProvinceCities.
        // User request: "A la hora de realizar una busqueda que aparezcan en el buscador solamente las poblaciones que dispongan de viviendas para ofrecer." -> ONLY available.

        return allProvinceCities.filter(c => citySet.has(c));
    }, [properties, province]);

    // Filter logic
    const availableTypes = useMemo(() => {
        if (!properties || properties.length === 0) return PROPERTY_TYPES;

        let filtered = properties;

        // Filter by province
        if (province) {
            filtered = filtered.filter(p => p.province === province);
        }

        // Filter by city
        if (city) {
            filtered = filtered.filter(p => p.city === city);
        }

        // Get unique types from the filtered properties
        const typeSet = new Set(filtered.map(p => p.type));

        // Return PROPERTY_TYPES that exist in the set (to maintain order)
        return PROPERTY_TYPES.filter(t => typeSet.has(t));
    }, [properties, province, city]);

    const filteredProperties = useMemo(() => {
        if (loading) return [];
        return properties.filter(property => {
            const matchProvince = province ? property.province === province : true;
            const matchCity = city ? property.city === city : true;
            const matchType = type ? property.type.toLowerCase() === type.toLowerCase() : true;
            // Exclude Price on Demand properties from price filtering if a filter is set
            const matchMinPrice = minPrice ? (!property.price_on_demand && property.price >= parseInt(minPrice)) : true;
            const matchMaxPrice = maxPrice ? (!property.price_on_demand && property.price <= parseInt(maxPrice)) : true;

            return matchProvince && matchCity && matchType && matchMinPrice && matchMaxPrice;
        });
    }, [properties, loading, province, city, type, minPrice, maxPrice]);

    return (
        <div className="page catalog">
            <SEO
                title="Property Catalogue"
                description="Explore our exclusive collection of luxury villas, apartments, and estates in the most prestigious locations in Andalusia."
                url="/catalog"
            />

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
        </div>
    );
};

export default Catalog;
