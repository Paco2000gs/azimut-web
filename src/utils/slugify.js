/**
 * Generates a SEO-friendly slug from a property object
 * Format: {type}-{city}-{id}
 * Example: villa-marbella-11, penthouse-sotogrande-23
 */
export const generatePropertySlug = (property) => {
    if (!property) return '';

    const type = property.type || 'property';
    const city = property.city || 'location';
    const id = property.id;

    // Convert to lowercase and remove accents
    const normalize = (str) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };

    const typeSlug = normalize(type);
    const citySlug = normalize(city);

    return `${typeSlug}-${citySlug}-${id}`;
};

/**
 * Extracts the property ID from a slug
 * Example: "villa-marbella-11" -> 11
 */
export const extractIdFromSlug = (slug) => {
    if (!slug) return null;

    // The ID is always the last part after the last hyphen
    const parts = slug.split('-');
    const id = parts[parts.length - 1];

    // Check if it's a valid number
    const numId = parseInt(id, 10);
    return isNaN(numId) ? null : numId;
};

/**
 * Checks if a string is a slug (contains hyphens) or just an ID (numeric)
 */
export const isSlug = (str) => {
    if (!str) return false;
    return str.includes('-') || isNaN(parseInt(str, 10));
};
