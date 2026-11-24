// The one way buyers reach Azimut Property is email, and this is the only file
// that spells the address out. Client decision (Nov 2026): the public site shows
// no phone number and no WhatsApp — no tel: or wa.me links and no "telephone"
// in the JSON-LD. Import from here instead of typing the address in a component.
export const CONTACT_EMAIL = 'info@azimutproperty.com';

// Window event that opens the site-wide contact dialog (ContactCTA) from any
// other button: window.dispatchEvent(new Event(CONTACT_OPEN_EVENT)).
export const CONTACT_OPEN_EVENT = 'azimut:contact-open';

/**
 * mailto: link to CONTACT_EMAIL. Subject and body are optional and encoded
 * here, so callers pass plain text.
 */
export const contactMailto = ({ subject, body } = {}) => {
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    return `mailto:${CONTACT_EMAIL}${params.length ? `?${params.join('&')}` : ''}`;
};
