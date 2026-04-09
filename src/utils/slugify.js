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

/**
 * Generates a SEO-friendly slug for a blog post from its title and ID.
 * Format: {title-slug}-{id}
 * Example: "Luxury Villas in Marbella" with id 3 -> "luxury-villas-in-marbella-3"
 */
export const generateBlogSlug = (post) => {
    if (!post) return '';

    const normalize = (str) => {
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const titleSlug = normalize(post.title || 'post');
    return `${titleSlug}-${post.id}`;
};

/**
 * Extracts the blog post ID from a blog slug.
 * Works with both slug format ("luxury-villas-marbella-3") and plain ID ("3").
 */
export const extractBlogId = (slugOrId) => {
    if (!slugOrId) return null;

    // If it's a plain number, return it directly
    const num = parseInt(slugOrId, 10);
    if (!isNaN(num) && String(num) === slugOrId) return num;

    // Extract ID from end of slug
    const parts = slugOrId.split('-');
    const id = parseInt(parts[parts.length - 1], 10);
    return isNaN(id) ? null : id;
};
