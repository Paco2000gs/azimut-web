/**
 * Custom SEO slugs for properties.
 * Maps: custom slug -> property ID, and property ID -> custom slug.
 * When a property has a custom slug, it uses /properties/{custom-slug}
 * instead of the default /property/{type}-{city}-{id} format.
 */
const CUSTOM_SLUGS = {
    // slug -> id
    'equestrian-estate-vineyard-sotogrande-cadiz-48-hectares': 19,
    'luxury-villa-sotogrande-alto-golf-views-private-spa': 22,
};

// Reverse map: id -> slug
const ID_TO_CUSTOM_SLUG = Object.fromEntries(
    Object.entries(CUSTOM_SLUGS).map(([slug, id]) => [id, slug])
);

/**
 * Check if a slug is a custom SEO slug
 */
export const isCustomSlug = (slug) => slug in CUSTOM_SLUGS;

/**
 * Get property ID from a custom slug
 */
export const getIdFromCustomSlug = (slug) => CUSTOM_SLUGS[slug] || null;

/**
 * Get custom slug for a property ID (if one exists)
 */
export const getCustomSlugForId = (id) => ID_TO_CUSTOM_SLUG[id] || null;

/**
 * Generates a SEO-friendly slug from a property object.
 * If the property has a custom slug, returns that instead.
 * Format (default): {type}-{city}-{id}
 * Example: villa-marbella-11, penthouse-sotogrande-23
 */
export const generatePropertySlug = (property) => {
    if (!property) return '';

    // Check for custom slug first
    const customSlug = getCustomSlugForId(property.id);
    if (customSlug) return customSlug;

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
 * Generates the full path for a property (includes the base path).
 * Custom slugs use /properties/, default slugs use /property/.
 */
export const generatePropertyPath = (property) => {
    if (!property) return '';
    const customSlug = getCustomSlugForId(property.id);
    if (customSlug) return `/properties/${customSlug}`;
    return `/property/${generatePropertySlug(property)}`;
};

/**
 * Extracts the property ID from a slug (default or custom).
 * Example: "villa-marbella-11" -> 11
 * Example: "equestrian-estate-vineyard-sotogrande-cadiz-48-hectares" -> 19
 */
export const extractIdFromSlug = (slug) => {
    if (!slug) return null;

    // Check custom slugs first
    const customId = getIdFromCustomSlug(slug);
    if (customId !== null) return customId;

    // Default: ID is the last part after the last hyphen
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
