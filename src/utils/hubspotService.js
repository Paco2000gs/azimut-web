/**
 * HubSpot Integration Service
 * Handles data formatting and submission to HubSpot CRM.
 */

// Configuration - Replace with actual values from environment variables in production
const HUBSPOT_CONFIG = {
    PORTAL_ID: import.meta.env.VITE_HUBSPOT_PORTAL_ID || 'demo_portal_id',
    FORM_GUID: import.meta.env.VITE_HUBSPOT_FORM_GUID || 'demo_form_guid',
    API_URL: 'https://api.hsforms.com/submissions/v3/integration/submit'
};

/**
 * Submits lead data to HubSpot
 * @param {Object} data - The lead data (name, email, phone, message, etc.)
 * @returns {Promise<boolean>} - True if successful (or simulated success)
 */
export const submitToHubSpot = async (data) => {
    // Map internal field names to HubSpot internal names
    // These names must match exactly what is defined in the HubSpot Form
    const fields = [
        { name: 'firstname', value: data.name },
        { name: 'email', value: data.email },
        { name: 'phone', value: data.phone },
        { name: 'message', value: data.message },
        { name: 'interest_type', value: data.interest }, // Custom property in HubSpot
        { name: 'property_id', value: data.propertyId || '' }, // Custom property
        { name: 'lead_source', value: data.source || 'Website' }
    ];

    const payload = {
        fields,
        context: {
            pageUri: window.location.href,
            pageName: document.title
        }
    };

    console.group('🚀 HubSpot Submission (Simulation)');
    console.log('Endpoint:', `${HUBSPOT_CONFIG.API_URL}/${HUBSPOT_CONFIG.PORTAL_ID}/${HUBSPOT_CONFIG.FORM_GUID}`);
    console.log('Payload:', payload);
    console.groupEnd();

    // In a real implementation, we would fetch() here.
    // For now, we simulate a network delay and success.

    /*
    try {
        const response = await fetch(`${HUBSPOT_CONFIG.API_URL}/${HUBSPOT_CONFIG.PORTAL_ID}/${HUBSPOT_CONFIG.FORM_GUID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        return response.ok;
    } catch (error) {
        console.error('HubSpot Submission Error:', error);
        return false;
    }
    */

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('✅ HubSpot submission simulated successfully.');
            resolve(true);
        }, 800);
    });
};
