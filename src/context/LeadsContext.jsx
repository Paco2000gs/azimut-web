import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';
import { submitToHubSpot } from '../utils/hubspotService';

const LeadsContext = createContext();

export const useLeads = () => useContext(LeadsContext);

export const LeadsProvider = ({ children }) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const addLead = async (leadData) => {
        const newLead = {
            status: 'New', // Default status
            ...leadData
        };

        try {
            // 1. Save to Supabase (Internal Admin Dashboard)
            const { data, error } = await supabase
                .from('leads')
                .insert([newLead])
                .select()
                .single();

            if (error) throw error;

            setLeads(prev => [data, ...prev]);

            // 2. Send to HubSpot (External CRM)
            submitToHubSpot(leadData).catch(err => console.error("HubSpot Error:", err));

            return data;
        } catch (error) {
            console.error('Error adding lead:', error.message);
            throw error;
        }
    };

    const deleteLead = async (id) => {
        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setLeads(prev => prev.filter(lead => lead.id !== id));
        } catch (error) {
            console.error('Error deleting lead:', error.message);
        }
    };

    const updateLeadStatus = async (id, status) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status })
                .eq('id', id);

            if (error) throw error;

            setLeads(prev => prev.map(lead =>
                lead.id === id ? { ...lead, status } : lead
            ));
        } catch (error) {
            console.error('Error updating lead status:', error.message);
        }
    };

    const getLeadsStats = () => {
        return {
            total: leads.length,
            new: leads.filter(l => l.status === 'New').length,
            contacted: leads.filter(l => l.status === 'Contacted').length,
            qualified: leads.filter(l => l.status === 'Qualified').length
        };
    };

    return (
        <LeadsContext.Provider value={{ leads, addLead, deleteLead, updateLeadStatus, getLeadsStats, loading }}>
            {children}
        </LeadsContext.Provider>
    );
};
