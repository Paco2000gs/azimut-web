import { extractIdFromSlug } from './slugify';

// Lead events for Google Tag Manager (GTM-5WRNRSBS, loaded in index.html).
// GTM turns them into GA4 events; the tags and the "key event" flag live in
// GTM and GA4, not here.
//
//   click_email  every click on a mailto: link
//   form_submit  a form whose lead was saved (never on a failed attempt)
//
// Both carry page_path, form_name and property_id. GTM keeps data-layer keys
// between pushes, so a key with no value is pushed as undefined: otherwise a
// click on /contact would inherit the property_id of the listing seen before.

const PROPERTY_PATH = /^\/(?:property|properties|dossier)\/([^/]+)\/?$/;

const propertyIdFromPath = (pathname) => {
    const match = pathname.match(PROPERTY_PATH);
    const id = match ? extractIdFromSlug(match[1]) : null;
    return id == null ? undefined : String(id);
};

const pushLeadEvent = (event, { formName, propertyId } = {}) => {
    if (typeof window === 'undefined') return;
    const pagePath = window.location.pathname;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event,
        page_path: pagePath,
        form_name: formName || undefined,
        property_id: propertyId != null ? String(propertyId) : propertyIdFromPath(pagePath),
    });
};

export const trackFormSubmit = (formName, propertyId) =>
    pushLeadEvent('form_submit', { formName, propertyId });

export const trackEmailClick = (formName) =>
    pushLeadEvent('click_email', { formName });
