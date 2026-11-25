/* eslint-env node */
/**
 * Per-network limits. `hard` values come from the official docs checked on
 * 2026-10-26 (see docs/redes-sociales/PLAN.md); the ones marked UNVERIFIED are
 * conservative guesses kept well below the commonly cited figure. `target`
 * values are editorial: what reads well, not what the API accepts.
 */
export const LIMITS = {
    linkedin: {
        maxChars: 3000,          // UNVERIFIED: not stated in the Posts API docs
        targetChars: 1300,
        maxHashtags: 5,
        minImages: 1,
        maxImages: 20,           // multiImage: 2..20 (verified)
        imageTypes: ['image/jpeg', 'image/png', 'image/gif'],
    },
    facebook: {
        maxChars: 5000,          // UNVERIFIED: well under the commonly cited limit
        targetChars: 600,
        maxHashtags: 5,
        minImages: 1,
        maxImages: 10,           // editorial cap; Page posts limit unverified
        maxImageBytes: 4 * 1024 * 1024, // verified: 4 MB per photo
        imageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'],
    },
    instagram: {
        maxChars: 2200,          // verified
        targetChars: 1500,
        maxHashtags: 30,         // verified (we aim for 10-15)
        minImages: 1,
        maxImages: 20,           // carousel: up to 20 (verified)
        maxImageBytes: 8 * 1024 * 1024, // verified
        imageTypes: ['image/jpeg'],     // verified: JPEG only
    },
    youtube: {
        maxTitleChars: 100,      // verified
        maxDescriptionBytes: 5000, // verified
        maxTagsChars: 500,       // verified
        maxHashtags: 5,
        minImages: 0,
        maxImages: 0,
    },
};
