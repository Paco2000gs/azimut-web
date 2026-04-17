/**
 * Utility to generate optimized URLs for Supabase Storage images.
 * Leverages Supabase Image Transformations (if enabled).
 *
 * NOTE: `format` parameter (webp/avif) requires Supabase Pro plan with
 * Image Transformations enabled. On free/starter plans, omit `format`
 * to avoid 400 errors. Width, height, quality and resize work on all plans.
 */

export const getOptimizedImageUrl = (url, options = {}) => {
    if (!url) return 'https://via.placeholder.com/800x600?text=No+Image';
    if (!url.includes('supabase.co')) return url; // Return original if not Supabase

    const {
        width,
        height,
        quality = 80,
        resize = 'cover' // cover | contain | fill
    } = options;

    // Construct query parameters (no format — requires Pro plan)
    const params = new URLSearchParams();

    if (width) params.append('width', width);
    if (height) params.append('height', height);
    params.append('quality', quality);
    params.append('resize', resize);

    // If the URL already has params, append to them
    const separator = url.includes('?') ? '&' : '?';

    return `${url}${separator}${params.toString()}`;
};
