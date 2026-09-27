import { supabase } from './supabaseClient';
import { compressImage } from './imageCompression';

/**
 * Uploads a file to Supabase Storage
 * @param {File} file - The file object to upload
 * @param {string} folder - The folder path (e.g., 'properties/123')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFile = async (file, folder) => {
    try {
        // Downscale + re-encode images before they hit the bucket. This is a
        // no-op for videos/PDFs (and returns the original if it can't help), so
        // it is safe to run on every upload — it's the main defence against the
        // 1 GB Storage cap.
        const toUpload = await compressImage(file);

        const fileExt = toUpload.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('properties') // Bucket name
            .upload(filePath, toUpload);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('properties')
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading file:', error.message);
        throw error;
    }
};

/**
 * Deletes a file from Supabase Storage
 * @param {string} url - The public URL of the file to delete
 */
export const deleteFile = async (url) => {
    try {
        // Extract path from URL
        // URL format: https://.../storage/v1/object/public/properties/folder/filename.ext
        const path = url.split('/properties/')[1];
        // Not one of ours (an external image pasted into a post, say): nothing
        // is left behind, so this counts as clean rather than as a failure.
        if (!path) return true;

        const { data, error } = await supabase.storage
            .from('properties')
            .remove([path]);

        if (error) {
            throw error;
        }

        // A storage policy that denies the delete does not always come back as
        // an error: it can return an empty list instead, which reads as success
        // and leaves the file paying for itself in the bucket forever. Treat
        // "nothing was removed" as the failure it is.
        return Array.isArray(data) && data.length > 0;
    } catch (error) {
        console.error('Error deleting file:', error.message);
        // Don't throw here, just log it. We don't want to block DB deletion if image deletion fails.
        return false;
    }
};

const BUCKET = 'properties';
// Supabase honours a list() page of 100 exactly, so "fewer than a full page"
// reliably means the last page. A bigger requested limit can be silently capped
// by the server, which would make that end-of-page test miss files.
const PAGE = 100;
// A runaway bucket must not hang the panel with thousands of list calls. 800
// pages of 100 covers up to ~80k files; past that we report the total as
// partial rather than spinning forever.
const MAX_PAGES = 800;

/**
 * Totals the REAL bytes stored in the `properties` bucket by walking it
 * recursively, so the admin can watch the Supabase free-tier cap (1 GB of
 * Storage) without opening the Supabase dashboard.
 *
 * Storage — not the tiny Postgres database — is what actually fills up on this
 * project: originals are uploaded uncompressed (see uploadFile above), and a
 * denied delete can leave orphans behind. This is the number that matters.
 *
 * Layout walked: properties/<id>/{photos,plans,videos}/... and posts/...
 *
 * @returns {Promise<{ totalBytes:number, fileCount:number,
 *   byTopFolder: Record<string, number>, truncated:boolean }>}
 *   `truncated` is true if the page cap was hit before the walk finished.
 */
export const getBucketUsage = async () => {
    if (!supabase) throw new Error('Supabase is not configured');

    let totalBytes = 0;
    let fileCount = 0;
    const byTopFolder = {};
    let pages = 0;
    let truncated = false;

    // Depth-first walk. `top` is the root folder the bytes roll up to (a
    // property id, or "posts"), so nested photos/plans/videos group under
    // their property in the breakdown.
    const walk = async (prefix, top) => {
        let offset = 0;
        for (;;) {
            if (pages >= MAX_PAGES) { truncated = true; return; }
            pages++;
            const { data, error } = await supabase.storage
                .from(BUCKET)
                .list(prefix, { limit: PAGE, offset, sortBy: { column: 'name', order: 'asc' } });
            if (error) throw error;
            if (!data || data.length === 0) break;

            for (const entry of data) {
                const size = entry?.metadata?.size;
                if (typeof size === 'number') {
                    // A real file (folders come back with no metadata).
                    totalBytes += size;
                    fileCount++;
                    const key = top || entry.name;
                    byTopFolder[key] = (byTopFolder[key] || 0) + size;
                } else {
                    const childPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
                    await walk(childPrefix, top || entry.name);
                    if (truncated) return;
                }
            }

            if (data.length < PAGE) break; // last page
            offset += PAGE;
        }
    };

    await walk('', '');
    return { totalBytes, fileCount, byTopFolder, truncated };
};
