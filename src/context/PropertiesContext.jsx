import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';

const PropertiesContext = createContext();

export const useProperties = () => useContext(PropertiesContext);

export const PropertiesProvider = ({ children }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
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
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', id);

            if (error) throw error;
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
            const { error } = await supabase
                .from('property_media')
                .delete()
                .eq('id', mediaId);

            if (error) throw error;
            return { success: true };
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
