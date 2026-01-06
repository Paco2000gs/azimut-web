import { supabase } from './supabaseClient';

/**
 * Uploads a file to Supabase Storage
 * @param {File} file - The file object to upload
 * @param {string} folder - The folder path (e.g., 'properties/123')
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFile = async (file, folder) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('properties') // Bucket name
            .upload(filePath, file);

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
        if (!path) return;

        const { error } = await supabase.storage
            .from('properties')
            .remove([path]);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Error deleting file:', error.message);
        // Don't throw here, just log it. We don't want to block DB deletion if image deletion fails.
    }
};
