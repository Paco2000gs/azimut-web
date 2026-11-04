/* eslint-env node */
import { generatePropertyPath } from '../../src/utils/slugify.js';

export const propertyLink = (siteUrl, property) => `${siteUrl}${generatePropertyPath(property)}`;

export const formatPrice = (property) => {
    if (property.price_on_demand || !Number(property.price)) return 'Precio a consultar';
    return `${Number(property.price).toLocaleString('es-ES', { useGrouping: 'always' })} €`;
};

/**
 * Photos in display order: the cover first (if it is one of the uploads), then
 * the rest as they were added. Only `image` media: plans and videos never go
 * into a social post.
 */
export const pickPhotos = (property, max = 12) => {
    const images = (property.property_media || [])
        .filter(m => m.type === 'image' && m.url)
        .sort((a, b) => (a.id || 0) - (b.id || 0))
        .map(m => m.url);
    const cover = property.image && images.includes(property.image) ? [property.image] : [];
    return [...new Set([...cover, ...images])].slice(0, max);
};

/** The facts the copywriter may use. Nothing outside this object goes in a post. */
export const propertyFacts = (property, link) => ({
    titulo: property.title,
    tipo: property.type,
    ciudad: property.city,
    provincia: property.province,
    precio: formatPrice(property),
    dormitorios: Number(property.bedrooms) || null,
    banos: Number(property.bathrooms) || null,
    superficie_construida_m2: Number(property.area) || null,
    parcela_m2: Number(property.plot) || null,
    caracteristicas: property.features || [],
    descripcion: String(property.description || '').slice(0, 4000),
    enlace: link,
});
