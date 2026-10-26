import { supabase } from './supabaseClient';

/**
 * Client for /api/social (Vercel Function). Every call carries the admin's
 * Supabase session token; the server checks it against ADMIN_EMAILS.
 */
export const socialFetch = async (path, { method = 'GET', body } = {}) => {
    const { data } = supabase ? await supabase.auth.getSession() : { data: null };
    const token = data?.session?.access_token;
    const res = await fetch(`/api/social/${path}`, {
        method,
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON error page */ }
    if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
    return json;
};

/**
 * The "property published" event. Deliberately fire-and-forget: generating
 * social drafts must never slow down, block or undo saving a property.
 */
export const notifyPropertyPublished = (propertyId) => {
    socialFetch('property-published', { method: 'POST', body: { propertyId } })
        .catch(err => console.warn('[social] No se pudieron crear los borradores:', err.message));
};
