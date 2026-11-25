import { slugifyLocation } from './slugify';

// Spanish plural for each listing type, as internal links read it.
export const TYPE_LABELS = {
    finca: 'Fincas',
    villa: 'Villas',
    mansion: 'Mansiones',
    plot: 'Terrenos',
    penthouse: 'Áticos',
    apartment: 'Apartamentos',
    townhouse: 'Casas adosadas',
};

/**
 * The listing types a location actually holds, for /venta/{location}/{type}
 * links. Those links used to be a fixed finca / plot / villa set, and every
 * combination without stock (/venta/malaga/plot, /venta/huelva/villa...)
 * answered 404: 21 of the 26 404s in Search Console (16 Nov 2026).
 *
 * `types` is empty when the location holds a single type: that filter page
 * lists exactly what the location page does and declares it as canonical, so
 * it is not linked (the sitemap leaves it out for the same reason).
 * `name` is the location as the listings spell it ("Cádiz", "Sevilla").
 */
export const typesIn = (properties, locationSlug) => {
    if (!locationSlug || !properties?.length) return { name: '', types: [] };
    const isProvince = properties.some(p => slugifyLocation(p.province) === locationSlug);
    const here = properties.filter(p => slugifyLocation(isProvince ? p.province : p.city) === locationSlug);
    const types = [...new Set(here.map(p => slugifyLocation(p.type)).filter(t => TYPE_LABELS[t]))];
    return {
        name: here[0] ? (isProvince ? here[0].province : here[0].city) : '',
        types: types.length > 1 ? types : [],
        count: here.length,
    };
};
