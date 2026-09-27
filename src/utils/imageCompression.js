/**
 * Client-side image downscale + re-encode, run right before an upload to
 * Supabase Storage so originals stop landing in the bucket at full camera
 * resolution.
 *
 * WHY: Storage — not the tiny Postgres database — is what fills the 1 GB free
 * tier on this project, and the single biggest contributor is property photos
 * uploaded raw (a phone shot is 3–12 MB). Nothing on the site is ever served
 * above 1600px (see imageOptimizer.js), so keeping 4000px originals only burns
 * quota. A 4000px JPEG downscaled to 2000px is roughly a quarter of the pixels
 * before re-encoding even helps.
 *
 * Rules that keep this safe:
 *  - Only touches raster images. Videos, PDFs, SVG and GIF pass through
 *    untouched (SVG would lose scalability, GIF its animation, and video/PDF
 *    can't go through a 2D canvas at all).
 *  - Keeps the source format (JPEG->JPEG, PNG->PNG, WebP->WebP), so the stored
 *    file that feeds og:image / JSON-LD stays a format every crawler accepts,
 *    and the extension uploadFile derives from the name stays valid.
 *  - Only downscales; never upscales. Respects EXIF orientation.
 *  - If the re-encoded file is not actually smaller, the original is kept.
 *  - Any failure returns the original, so a decode quirk never blocks a save.
 */

const MAX_DIMENSION = 2000; // longest edge in px; display tops out at 1600
const QUALITY = 0.82;       // applies to JPEG/WebP only
const MIN_BYTES = 400 * 1024; // below this, and already small, re-encoding rarely pays off

// Raster formats a canvas would damage rather than shrink.
const PASSTHROUGH = /^(image\/svg\+xml|image\/gif)$/i;

export const compressImage = async (file) => {
    try {
        if (!file || !file.type || !file.type.startsWith('image/')) return file;
        if (PASSTHROUGH.test(file.type)) return file;
        if (typeof document === 'undefined' || typeof createImageBitmap === 'undefined') return file;

        // 'from-image' applies EXIF orientation so portrait photos are not
        // silently rotated when redrawn onto the canvas.
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null);
        if (!bitmap) return file;

        const { width, height } = bitmap;
        const longest = Math.max(width, height);
        const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;

        // Nothing to gain: already within bounds and already small.
        if (scale === 1 && file.size < MIN_BYTES) {
            bitmap.close?.();
            return file;
        }

        const targetW = Math.max(1, Math.round(width * scale));
        const targetH = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            bitmap.close?.();
            return file;
        }
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        bitmap.close?.();

        // Keep the format family. PNG stays lossless (quality is ignored for
        // it), which preserves crisp lines on plan drawings.
        const outType = (file.type === 'image/jpeg' || file.type === 'image/webp')
            ? file.type
            : (file.type === 'image/png' ? 'image/png' : 'image/jpeg');

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, outType, QUALITY));
        if (!blob || blob.size >= file.size) return file; // no real gain — keep original

        return new File([blob], file.name, { type: outType, lastModified: Date.now() });
    } catch (err) {
        console.warn('compressImage skipped (uploading original):', err?.message);
        return file;
    }
};
