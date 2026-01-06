/**
 * Utility to generate optimized URLs for Supabase Storage images.
 * Leverages Supabase Image Transformations (if enabled).
 */

export const getOptimizedImageUrl = (url, options = {}) => {
    if (!url) return 'https://via.placeholder.com/800x600?text=No+Image';
    if (!url.includes('supabase.co')) return url; // Return original if not Supabase

    const {
        width,
        height,
        quality = 80,
        format = 'webp', // Default to WebP
        resize = 'cover' // cover | contain | fill
    } = options;

    // Construct query parameters
    const params = new URLSearchParams();

    if (width) params.append('width', width);
    if (height) params.append('height', height);
    params.append('quality', quality);
    params.append('format', format);
    params.append('resize', resize);

    // If the URL already has params, append to them
    const separator = url.includes('?') ? '&' : '?';

    return `${url}${separator}${params.toString()}`;
};
