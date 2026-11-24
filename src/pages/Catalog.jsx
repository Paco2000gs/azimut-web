import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProperties } from '../context/PropertiesContext';
import PropertyCard from '../components/PropertyCard';
import PropertyCardWide from '../components/PropertyCardWide';
import SEO from '../components/SEO';
import '../styles/Catalog.css';

import { PROVINCES, CITIES, PROPERTY_TYPES } from '../constants/propertyOptions';
import { generatePropertyPath, slugifyLocation } from '../utils/slugify';
import LocationSEOContent from '../components/LocationSEOContent';
import LeadMagnet from '../components/LeadMagnet';
import { TYPE_LABELS, typesIn } from '../utils/listingTypes';

// Shared with the links other pages emit, so a breadcrumb always points at a URL
// this page resolves.
const slugifyCity = slugifyLocation;

const BRAND = ' | Azimut Property';

// The first candidate that fits Google's ~60-character title width.
const fitTitle = (...candidates) => candidates.find(t => t.length <= 60) || candidates[candidates.length - 1];

// How a type filter page names its listings: `long` in the title and H1,
// `short` when a long place name would push the title past 60 characters.
const TYPE_SEO = {
    finca: { long: 'Fincas Rústicas', short: 'Fincas', plural: 'fincas rústicas' },
    villa: { long: 'Villas de Lujo', short: 'Villas', plural: 'villas de lujo' },
    mansion: { long: 'Mansiones', short: 'Mansiones', plural: 'mansiones' },
};

const listingsPhrase = (count) => (count === 1 ? '1 inmueble seleccionado' : `${count} inmuebles seleccionados`);

/**
 * Title, description and H1 for /venta/{location}/{type}. These pages used to
 * repeat their parent's metadata word for word: /venta/sevilla/finca shipped
 * the title, description and H1 of /venta/sevilla, and Search Console filed
 * /venta/cartama/finca and /venta/almonte/finca as duplicates (Nov 2026). The
 * count comes from the listings, so the text never claims stock it lacks.
 */
const typeSeoFor = (typeSlug, place, count, isProvince) => {
    const label = TYPE_SEO[typeSlug]
        || { long: TYPE_LABELS[typeSlug] || 'Inmuebles', short: TYPE_LABELS[typeSlug] || 'Inmuebles', plural: (TYPE_LABELS[typeSlug] || 'inmuebles').toLowerCase() };
    const where = isProvince ? `la provincia de ${place}` : place;
    const lead = `${label.plural.charAt(0).toUpperCase()}${label.plural.slice(1)} en venta en ${where}`;
    return {
        title: fitTitle(`${label.long} en Venta en ${place}${BRAND}`, `${label.short} en ${place}${BRAND}`),
        description: count > 0
            ? `${lead}: ${listingsPhrase(count)} por Azimut Property. Solicite por email ${count === 1 ? 'su dossier privado' : 'el dossier privado de cada uno'}.`
            : `${lead}. Consulte por email con Azimut Property las opciones disponibles, también las que no se publican.`,
        keywords: `${label.plural} en venta ${place}, comprar ${label.plural} ${place}, ${label.short.toLowerCase()} ${place}`,
        h1: `${label.long} en Venta en ${place}`,
        hero: `Selección de ${label.plural} en ${where}`,
        crumb: label.short,
    };
};

// `city` holds either a listing's name (from the selector) or one rebuilt from
// the URL, which has lost its accents and hyphens ("Gaucin", "Medina Sidonia").
// Compared on slugs, both forms find listings named "Gaucín" or "Medina-Sidonia".
const isSameCity = (a, b) => slugifyCity(a) === slugifyCity(b);

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
        'barcelona': 'Barcelona',
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
            // Check if urlArea is a property type (e.g., /venta/cadiz/finca).
            // Accept both singular and plural slugs so sitemap URLs like
            // /venta/cadiz/fincas, /venta/malaga/villas, /venta/sevilla/mansions
            // filter correctly instead of serving an unfiltered (duplicate) page.
            const areaSlug = urlArea.toLowerCase();
            const typeMatch = PROPERTY_TYPES.find(t => {
                const s = t.toLowerCase().replace(/\s+/g, '-');
                return s === areaSlug || `${s}s` === areaSlug;
            });
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

    // The option holding the listing's own spelling, so a city that came from the
    // URL shows as selected instead of leaving the selector on "Todas las ciudades".
    const selectedCity = availableCities.find(c => isSameCity(c, city)) ?? city;

    // Filter logic for available types
    const availableTypes = useMemo(() => {
        if (!properties || properties.length === 0) return PROPERTY_TYPES;

        let filtered = properties;
        if (province) filtered = filtered.filter(p => p.province === province);
        if (city) filtered = filtered.filter(p => isSameCity(p.city, city));

        const typeSet = new Set(filtered.map(p => p.type));
        return PROPERTY_TYPES.filter(t => typeSet.has(t));
    }, [properties, province, city]);

    const filteredProperties = useMemo(() => {
        if (loading) return [];
        return properties.filter(property => {
            const matchProvince = province ? property.province === province : true;
            const matchCity = city ? isSameCity(property.city, city) : true;
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
            title: 'Fincas y Haciendas de Lujo en Cádiz | Azimut Property',
            description: 'Cortijos, haciendas y fincas ecuestres en venta en Cádiz, de Jerez y Arcos a Jimena de la Frontera, junto a Sotogrande. Fincas de lujo fuera de mercado.',
            keywords: 'cortijos en venta en Cádiz, cortijo de olivar Cádiz, finca de lujo Cádiz, hacienda histórica Cádiz, finca ecuestre Jerez, finca en venta Jimena de la Frontera, finca cerca de Sotogrande',
            h1: 'Fincas de Lujo, Haciendas y Fincas Ecuestres en Venta en Cádiz',
            hero: 'Del cortijo de olivar en Arcos a la finca ecuestre junto a Sotogrande: propiedad rural de alto nivel en la provincia de Cádiz',
            landing: '/cortijos-en-venta-cadiz',
        },
        'huelva': {
            title: 'Fincas con Terreno en Venta en Huelva | Azimut Property',
            description: 'Fincas, cortijos y chalets con terreno en venta en Huelva, entre Doñana y la Sierra de Aracena. Asesoramiento completo para el comprador internacional.',
            keywords: 'cortijos en venta en Huelva, fincas Huelva, cortijo Huelva, chalet con terreno Huelva, casa rural Huelva, propiedad rural Huelva',
            h1: 'Fincas y Chalets con Terreno en Venta en Huelva',
            hero: 'Propiedades rurales únicas entre el Parque Nacional de Doñana y la Sierra de Aracena',
            landing: '/cortijos-en-venta-huelva',
        },
        'sevilla': {
            title: 'Fincas y Haciendas en Venta en Sevilla | Azimut Property',
            description: 'Fincas y haciendas en venta en Sevilla: cortijos de olivar, haciendas históricas y fincas ecuestres en Carmona, Écija, Osuna y el Aljarafe.',
            keywords: 'cortijos en venta en Sevilla, cortijo en venta Sevilla, cortijos Sevilla, hacienda histórica en venta Sevilla, cortijo de olivar Sevilla, finca ecuestre Sevilla, finca de lujo Sevilla',
            h1: 'Haciendas, Cortijos de Olivar y Fincas Ecuestres en Venta en Sevilla',
            hero: 'Adquiere una hacienda histórica, un cortijo de olivar de inversión o una finca ecuestre en la provincia de Sevilla',
            landing: '/cortijos-en-venta-sevilla',
        },
        'malaga': {
            title: 'Fincas, Terrenos y Cortijos en Málaga | Azimut Property',
            description: 'Fincas rústicas, terrenos agrícolas y propiedades rurales en venta en el interior de Málaga: Ronda, la Axarquía y el Valle del Guadalhorce.',
            keywords: 'fincas Málaga, terrenos agrícolas Málaga, comprar cortijo Ronda, inversión suelo Málaga, casa de campo Málaga interior, finca olivar Málaga',
            h1: 'Fincas y Terrenos en Venta en Málaga Interior',
            hero: 'Descubre el potencial de inversión en el interior de la provincia de Málaga',
        },
        'almeria': {
            title: 'Fincas, Villas y Casas en Almería | Azimut Property',
            description: 'Fincas y cortijos en el valle del Almanzora, villas de golf en Desert Springs y casas junto al mar en Vera, Mojácar y Garrucha, en Almería.',
            keywords: 'propiedades Almería, finca Almería, villa Mojácar, casa Vera, comprar Garrucha, chalet Almanzora, Desert Springs golf',
            h1: 'Fincas, Villas y Casas en Venta en Almería',
            hero: 'Del cortijo del Almanzora a la villa frente al mar: la costa más luminosa de España',
        },
    };

    const provinceSeo = urlCity ? PROVINCE_SEO[urlCity.toLowerCase()] : null;

    // The location as the listings spell it ("Sanlúcar de Barrameda"), not as
    // rebuilt from the URL ("Sanlucar De Barrameda").
    const locationSlug = urlCity ? slugifyCity(urlCity) : '';
    const located = typesIn(properties, locationSlug);
    const placeName = located.name || (urlCity ? (PROVINCE_SLUGS[urlCity.toLowerCase()] || formatSlug(urlCity)) : '');

    // /venta/{location}/{type}: the type segment as a slug ("finca"), and how
    // many listings of that type the location holds.
    const areaType = urlArea
        ? PROPERTY_TYPES.find(t => {
            const s = t.toLowerCase().replace(/\s+/g, '-');
            return s === urlArea.toLowerCase() || `${s}s` === urlArea.toLowerCase();
        })
        : null;
    const areaTypeSlug = areaType ? slugifyCity(areaType) : '';
    const typeCount = areaTypeSlug
        ? properties.filter(p => slugifyCity((isProvincePage ? p.province : p.city) || '') === locationSlug
            && slugifyCity(p.type || '') === areaTypeSlug).length
        : 0;
    const typeSeo = areaTypeSlug && placeName ? typeSeoFor(areaTypeSlug, placeName, typeCount, isProvincePage) : null;
    const cityProvince = !isProvincePage && urlCity
        ? properties.find(p => slugifyCity(p.city || '') === locationSlug)?.province
        : '';

    // Canonical URL. A city+type silo (e.g. /venta/ronda/villa) whose result set
    // is IDENTICAL to its parent city/province page (e.g. /venta/ronda) is a
    // duplicate — Google was picking the parent as canonical on its own. Point the
    // canonical at the parent explicitly so the signal is consolidated instead of
    // self-referencing. Distinct subsets (a city with several types) keep self-canonical.
    const canonicalPath = useMemo(() => {
        const selfPath = urlCity ? `/venta/${urlCity}${urlArea ? `/${urlArea}` : ''}` : '/venta';
        if (!urlCity || !urlArea || loading || !properties?.length) return selfPath;
        // Compare on slugs (accent-insensitive) and derive scope from the URL, not
        // from the `type`/`city` UI state — those are set asynchronously in an
        // effect and may not be populated yet at prerender-capture time, which
        // would silently fall back to a self-canonical.
        const wanted = slugifyCity(urlCity);
        const areaSlug = urlArea.toLowerCase();
        const inScope = (p) => isProvincePage
            ? slugifyCity(p.province || '') === wanted
            : slugifyCity(p.city || '') === wanted;
        const matchesType = (p) => {
            const s = (p.type || '').toLowerCase().replace(/\s+/g, '-');
            return s === areaSlug || `${s}s` === areaSlug;
        };
        const cityScoped = properties.filter(inScope);
        const typeScoped = cityScoped.filter(matchesType);
        if (cityScoped.length > 0 && cityScoped.length === typeScoped.length) {
            return `/venta/${urlCity}`;
        }
        return selfPath;
    }, [urlCity, urlArea, isProvincePage, properties, loading]);

    // A location with no listings at all has nothing to offer the search that
    // lands on it: /venta/benalmadena and /venta/fuengirola drew 394 impressions
    // in 90 days at position 70+ and 0 clicks (Search Console, Nov 2026). They stay
    // live for visitors and for crawlers following their links, and the tag clears
    // itself on the first deploy after a listing arrives in that location.
    //
    // Compared on slugs from the URL rather than on filteredProperties: the city
    // filter compares display names, so accented or hyphenated cities (Gaucín,
    // Medina-Sidonia) match nothing there even though they do have listings.
    //
    // An empty dataset means the fetch failed, not that the site sold everything,
    // and must never tag every location page at once.
    const isEmptyLocation = useMemo(() => {
        if (!urlCity || loading || !properties?.length) return false;
        const wanted = slugifyCity(urlCity);
        return !properties.some(p => slugifyCity((isProvincePage ? p.province : p.city) || '') === wanted);
    }, [urlCity, isProvincePage, properties, loading]);

    // Dynamic SEO data
    // Spanish, like the page itself. The English fallbacks here were shipping as
    // the <title>/description of every city and silo page under a Spanish H1 and
    // body, which is the mixed-language signal Google weighs when it decides
    // "Crawled - currently not indexed". Province pages already use Spanish
    // (PROVINCE_SEO above), so the city and catalogue fallbacks follow suit.
    // City pages name the place as the listings spell it and say how many
    // listings it holds. The old description placed every town "en la Costa del
    // Sol", Constantina and Almonte included, and ran past 155 characters.
    const citySeoTitle = placeName
        ? fitTitle(`Propiedades de Lujo en Venta en ${placeName}${BRAND}`, `Propiedades en Venta en ${placeName}${BRAND}`, `Propiedades en ${placeName}${BRAND}`)
        : '';
    const citySeoDescription = located.count > 0
        ? `Propiedades en venta en ${placeName}${cityProvince ? ` (${cityProvince})` : ''}: ${listingsPhrase(located.count)} por Azimut Property. Solicite el dossier privado por email.`
        : `Propiedades en venta en ${placeName} con Azimut Property. Consulte por email las opciones disponibles, también las que no se publican.`;

    const seoTitle = useMemo(() => {
        if (typeSeo) return typeSeo.title;
        if (provinceSeo) return provinceSeo.title;
        if (urlCity) return citySeoTitle;
        if (type) return `${type}s de Lujo en Venta en Andalucía | Azimut Property`;
        return "Fincas y Cortijos en Venta en Andalucía | Azimut Property";
    }, [urlCity, type, provinceSeo, typeSeo, citySeoTitle]);

    const seoDescription = useMemo(() => {
        if (typeSeo) return typeSeo.description;
        if (provinceSeo) return provinceSeo.description;
        if (urlCity) return citySeoDescription;
        return "Catálogo de fincas rústicas, cortijos, haciendas y villas de lujo en venta en Sevilla, Cádiz, Huelva y Málaga, con dossier privado de cada inmueble.";
    }, [urlCity, provinceSeo, typeSeo, citySeoDescription]);

    const seoKeywords = useMemo(() => {
        if (typeSeo) return typeSeo.keywords;
        if (provinceSeo) return provinceSeo.keywords;
        if (urlCity) return `propiedades ${placeName}, fincas ${placeName}, inmobiliaria de lujo ${placeName}`;
        return "propiedades de lujo Costa del Sol, villas Marbella, casas Estepona, inmobiliaria Andalucía";
    }, [urlCity, placeName, provinceSeo, typeSeo]);

    const typeH1 = typeSeo?.h1;
    const typeDescription = typeSeo?.description;
    // Plain computation rather than useMemo: it read PROVINCE_SEO, rebuilt on
    // every render, so the memo never held (react-hooks flagged it).
    const breadcrumbItems = [
        { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.azimutproperty.com/" },
        { "@type": "ListItem", "position": 2, "name": "Propiedades en Venta", "item": "https://www.azimutproperty.com/venta" }
    ];
    if (urlCity) {
        breadcrumbItems.push({
            "@type": "ListItem",
            "position": 3,
            "name": provinceSeo?.h1 || `Propiedades en ${placeName}`,
            "item": `https://www.azimutproperty.com/venta/${urlCity}`
        });
    }
    // A type filter page adds its own level to the trail.
    if (urlCity && urlArea && typeH1) {
        breadcrumbItems.push({
            "@type": "ListItem",
            "position": 4,
            "name": typeH1,
            "item": `https://www.azimutproperty.com/venta/${urlCity}/${urlArea}`
        });
    }
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
    };

    // ItemList schema for province pages (helps Google index individual property links)
    const itemListSchema = useMemo(() => {
        if (!provinceSeo || filteredProperties.length === 0) return null;
        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": typeH1 || provinceSeo.h1,
            "description": typeDescription || provinceSeo.description,
            "url": `https://www.azimutproperty.com/venta/${urlCity}${urlArea ? `/${urlArea}` : ''}`,
            "numberOfItems": filteredProperties.length,
            "itemListElement": filteredProperties.slice(0, 10).map((prop, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "url": `https://www.azimutproperty.com${generatePropertyPath(prop)}`,
                "name": prop.title
            }))
        };
    }, [provinceSeo, filteredProperties, urlCity, urlArea, typeH1, typeDescription]);

    return (
        <div className="page catalog">
            <SEO
                title={seoTitle}
                description={seoDescription}
                url={canonicalPath}
                keywords={seoKeywords}
                noindex={isEmptyLocation}
                followLinks
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbJsonLd)}
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
                    <h1>{typeSeo ? typeSeo.h1 : provinceSeo ? provinceSeo.h1 : urlCity ? `Propiedades en Venta en ${placeName}` : city ? `Propiedades en Venta en ${city}` : 'Fincas, Cortijos y Villas de Lujo en Venta en Andalucía'}</h1>
                    <p>{typeSeo ? typeSeo.hero : provinceSeo ? provinceSeo.hero : urlCity ? `Descubre propiedades exclusivas en ${placeName}` : city ? `Descubre propiedades exclusivas en ${city}` : 'Fincas rústicas, cortijos de olivar, haciendas históricas y villas seleccionadas una a una, con acceso a inmuebles que no se publican y acompañamiento en toda la compra.'}</p>
                    {/* The catalogue's own way into the four provinces that carry
                        the search demand (/venta: CTR 1 %, position 37). */}
                    {!urlCity && (
                        <nav className="catalog-provinces" aria-label="Fincas por provincia">
                            <Link to="/venta/sevilla">Fincas en Sevilla</Link>
                            <Link to="/venta/cadiz">Fincas en Cádiz</Link>
                            <Link to="/venta/huelva">Fincas en Huelva</Link>
                            <Link to="/venta/malaga">Fincas en Málaga</Link>
                        </nav>
                    )}
                    {/* Anchor text is the query the landing targets ("cortijo en
                        venta en Sevilla"), not a generic "guía". */}
                    {provinceSeo?.landing && (
                        <p>¿Busca un <Link to={provinceSeo.landing}>cortijo en venta en {PROVINCE_SLUGS[urlCity.toLowerCase()]}</Link>?</p>
                    )}
                </div>
            </div>

            {/* Breadcrumbs UI */}
            <div className="container">
                <nav className="breadcrumbs" aria-label="Ruta de navegación">
                    <ol>
                        <li><a href="/">Inicio</a></li>
                        <li aria-hidden="true" className="breadcrumb-sep">/</li>
                        <li><a href="/venta">Propiedades</a></li>
                        {urlCity && (
                            <>
                                <li aria-hidden="true" className="breadcrumb-sep">/</li>
                                <li>
                                    {type
                                        ? <a href={`/venta/${urlCity}`}>{placeName}</a>
                                        : <span aria-current="page">{placeName}</span>}
                                </li>
                            </>
                        )}
                        {type && (
                            <>
                                <li aria-hidden="true" className="breadcrumb-sep">/</li>
                                <li><span aria-current="page">{typeSeo?.crumb || TYPE_LABELS[slugifyCity(type)] || type}</span></li>
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
                            <label htmlFor="filter-province">Provincia</label>
                            <select id="filter-province" value={province} onChange={handleProvinceChange} className="filter-select">
                                <option value="">Todas</option>
                                {PROVINCES.map(prov => (
                                    <option key={prov} value={prov}>{prov}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-item">
                            <label htmlFor="filter-city">Ciudad / Zona</label>
                            <select id="filter-city" value={selectedCity} onChange={(e) => setCity(e.target.value)} disabled={!province} className="filter-select">
                                <option value="">
                                    {!province
                                        ? "Seleccione una provincia"
                                        : availableCities.length === 0
                                            ? "Sin inmuebles"
                                            : "Todas las ciudades"}
                                </option>
                                {availableCities.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-item">
                            <label htmlFor="filter-type">Tipo</label>
                            <select id="filter-type" value={type} onChange={(e) => setType(e.target.value)} className="filter-select">
                                <option value="">Todas</option>
                                {availableTypes.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-item">
                            <label htmlFor="filter-min">Precio mín. (€)</label>
                            <input
                                id="filter-min"
                                type="number"
                                placeholder="Mín."
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="filter-input"
                            />
                        </div>

                        <div className="filter-item">
                            <label htmlFor="filter-max">Precio máx. (€)</label>
                            <input
                                id="filter-max"
                                type="number"
                                placeholder="Máx."
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="filter-input"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container catalog-results">
                {/* Results Count */}
                <div className="results-header" aria-live="polite">
                    {loading ? (
                        <span>Buscando…</span>
                    ) : (
                        <span>{filteredProperties.length} {filteredProperties.length === 1 ? 'inmueble disponible' : 'inmuebles disponibles'}</span>
                    )}
                </div>

                {/* Property Grid (Single Column for Wide Cards) */}
                <div className="property-list-wide">
                    {loading ? (
                        <div className="loading-state" role="status">
                            <div className="spinner" aria-hidden="true"></div>
                            <p>Cargando inmuebles…</p>
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
                            <h2>Ningún inmueble coincide con estos filtros</h2>
                            <p>Amplíe el rango de precios o elija otra provincia: nuestro registro fuera de mercado
                                suele incluir inmuebles que no aparecen aquí.</p>
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
