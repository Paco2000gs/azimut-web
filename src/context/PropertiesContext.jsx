import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { readPrerenderedData } from '../utils/prerenderedData';
import { deleteFile } from '../utils/storage';

const PropertiesContext = createContext();

export const useProperties = () => useContext(PropertiesContext);

// Read once, at module load. Vite's module scripts are deferred, so the island
// is already parsed by the time this runs.
const SEED = readPrerenderedData('properties');

export const PropertiesProvider = ({ children }) => {
    const [properties, setProperties] = useState(SEED || []);
    // Seeded pages are never "loading": the data they need is already here, so
    // detail pages skip the spinner and never reach their not-found branch.
    const [loading, setLoading] = useState(!SEED);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            // A seeded page already has its content painted. Flipping back to
            // loading would swap it for a spinner for no reason, and if this
            // refresh then fails the page would be worse off than before it ran.
            if (!SEED) setLoading(true);
            const { data, error } = await supabase
                .from('properties')
                .select('*, property_media(url, type)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProperties(data || []);
        } catch (err) {
            console.error('Error fetching properties:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addProperty = async (propertyData) => {
        try {
            const { data, error } = await supabase
                .from('properties')
                .insert([propertyData])
                .select()
                .single();

            if (error) throw error;
            setProperties(prev => [data, ...prev]);
            return { success: true, data };
        } catch (err) {
            console.error('Error adding property:', err.message);
            return { success: false, error: err.message };
        }
    };

    const updateProperty = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('properties')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setProperties(prev => prev.map(p => p.id === id ? data : p));
            return { success: true, data };
        } catch (err) {
            console.error('Error updating property:', err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteProperty = async (id) => {
        try {
            // Read the media rows while they still exist: once the property is
            // gone, nothing points at those files any more and the only way to
            // find them again is by hand in the Supabase dashboard.
            const { data: media } = await supabase
                .from('property_media')
                .select('url')
                .eq('property_id', id);

            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Files after the row, never before: a failed delete leaves an
            // orphan in storage, which is cheaper than a listing pointing at a
            // file that no longer exists.
            await Promise.all((media || []).map(m => deleteFile(m.url)));

            setProperties(prev => prev.filter(p => p.id !== id));
            return { success: true };
        } catch (err) {
            console.error('Error deleting property:', err.message);
            return { success: false, error: err.message };
        }
    };

    const addPropertyMedia = async (mediaData) => {
        try {
            const { data, error } = await supabase
                .from('property_media')
                .insert(mediaData)
                .select();

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error('Error adding property media:', err.message);
            return { success: false, error: err.message };
        }
    };

    const getPropertyMedia = async (propertyId) => {
        try {
            const { data, error } = await supabase
                .from('property_media')
                .select('*')
                .eq('property_id', propertyId);

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error('Error fetching property media:', err.message);
            return { success: false, error: err.message };
        }
    };

    const deletePropertyMedia = async (mediaId) => {
        try {
            const { data: media } = await supabase
                .from('property_media')
                .select('url')
                .eq('id', mediaId)
                .single();

            const { error } = await supabase
                .from('property_media')
                .delete()
                .eq('id', mediaId);

            if (error) throw error;

            const fileRemoved = media?.url ? await deleteFile(media.url) : true;

            return { success: true, fileRemoved };
        } catch (err) {
            console.error('Error deleting property media:', err.message);
            return { success: false, error: err.message };
        }
    };

    const getPropertyById = (id) => {
        return properties.find(p => p.id === parseInt(id));
    };

    return (
        <PropertiesContext.Provider value={{
            properties,
            loading,
            error,
            addProperty,
            updateProperty,
            deleteProperty,
            getPropertyById,
            addPropertyMedia,
            getPropertyMedia,
            deletePropertyMedia,
            refreshProperties: fetchProperties
        }}>
            {children}
        </PropertiesContext.Provider>
    );
};
