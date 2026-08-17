/**
 * Reads the data island that scripts/prerender.js bakes into every static page.
 *
 * Why this exists: Googlebot's renderer could not complete the Supabase XHRs.
 * Search Console's live test on /property/finca-jimena-de-la-frontera-8
 * (17 Aug 2026) logged "Error fetching properties: TypeError: Failed to fetch"
 * with 18 of 35 resources failing. The prerendered HTML arrived complete and
 * correct, and then hydration REPLACED it with the "not found" branch, which
 * Google filed as a Soft 404. Seeding the contexts from the page itself means
 * the first render never depends on the network, so a failed fetch can no
 * longer destroy content that was already served.
 *
 * Returns null when the island is absent (dev server, admin routes) so callers
 * fall back to fetching.
 */
export const readPrerenderedData = (key) => {
    if (typeof document === 'undefined') return null;

    const el = document.getElementById('__AZIMUT_DATA__');
    if (!el) return null;

    try {
        const data = JSON.parse(el.textContent);
        return Array.isArray(data?.[key]) ? data[key] : null;
    } catch {
        // A malformed island must never take the app down — fetching still works.
        return null;
    }
};
