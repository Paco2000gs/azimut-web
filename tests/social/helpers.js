import { randomBytes } from 'node:crypto';
import { getConfig } from '../../server/social/config.js';
import { createMemoryStore } from '../../server/social/store.js';
import { encrypt } from '../../server/social/crypto.js';

export const KEY = randomBytes(32).toString('base64');

export const testConfig = (overrides = {}) => ({
    ...getConfig({
        SOCIAL_DRY_RUN: 'true',
        SITE_URL: 'https://www.azimutproperty.com',
        ADMIN_EMAILS: 'admin@azimutproperty.com',
        SOCIAL_TOKEN_ENC_KEY: KEY,
        OAUTH_STATE_SECRET: 'state-secret',
        CRON_SECRET: 'cron-secret',
        VIDEO_WORKER_SECRET: 'worker-secret',
        META_APP_ID: 'app', META_APP_SECRET: 'appsecret',
        LINKEDIN_CLIENT_ID: 'li', LINKEDIN_CLIENT_SECRET: 'lisecret', LINKEDIN_ORGANIZATION_ID: '999',
        GOOGLE_CLIENT_ID: 'g', GOOGLE_CLIENT_SECRET: 'gsecret',
    }),
    ...overrides,
});

export const PROPERTY = {
    id: 501,
    title: 'Villa Contemporánea con Vistas Sobre Ronda',
    description: 'Exceptional contemporary villa with panoramic views over Ronda.',
    price: 1800000,
    price_on_demand: false,
    bedrooms: 4, bathrooms: 3, area: 325, plot: 700000,
    type: 'Villa', city: 'Ronda', province: 'Málaga',
    features: ['Piscina', 'Vistas'],
    image: '',
    property_media: [
        { id: 1, type: 'image', url: 'https://cdn.test/p/1.jpg' },
        { id: 2, type: 'image', url: 'https://cdn.test/p/2.jpg' },
        { id: 3, type: 'image', url: 'https://cdn.test/p/3.jpg' },
        { id: 4, type: 'plan', url: 'https://cdn.test/p/plan.pdf' },
    ],
};

export const LINK = 'https://www.azimutproperty.com/property/villa-ronda-501';

export const makeStore = () => createMemoryStore({
    properties: [structuredClone(PROPERTY)],
    users: { 'admin-jwt': { email: 'admin@azimutproperty.com' }, 'other-jwt': { email: 'intruso@example.com' } },
});

export const connectAll = async (store, key = KEY) => {
    const row = (network, account_id, extra = {}) => store.saveAccount({
        network, account_id, account_name: network, access_token_enc: encrypt(`${network}-token`, key), refresh_token_enc: null, ...extra,
    });
    await row('facebook', 'PAGE1');
    await row('instagram', 'IG1');
    await row('linkedin', 'urn:li:organization:999');
    await row('youtube', 'mine', { refresh_token_enc: encrypt('yt-refresh', key) });
};

/**
 * Programmable fetch: `routes` is a list of [matcher, handler]. matcher is a
 * string (prefix of "METHOD url") or a RegExp; handler returns a Response or
 * a { status, body, headers } shorthand. Every call is recorded.
 */
export const mockFetch = (routes) => {
    const calls = [];
    const fn = async (url, init = {}) => {
        const method = (init.method || 'GET').toUpperCase();
        const key = `${method} ${url}`;
        calls.push({ method, url: String(url), init, key });
        for (const [match, handler] of routes) {
            const ok = typeof match === 'string' ? key.startsWith(match) : match.test(key);
            if (ok) {
                const r = await handler({ method, url: String(url), init, calls });
                if (r instanceof Response) return r;
                const body = r.body === undefined ? '' : (typeof r.body === 'string' || r.body instanceof Uint8Array ? r.body : JSON.stringify(r.body));
                return new Response(body, { status: r.status || 200, headers: r.headers || {} });
            }
        }
        throw new Error(`Unmocked fetch: ${key}`);
    };
    fn.calls = calls;
    return fn;
};

export const noSleep = async () => {};

/** Minimal res object with the Vercel helpers the router uses. */
export const mockRes = () => {
    const res = { statusCode: 200, body: null, headers: {} };
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (b) => { res.body = b; return res; };
    res.redirect = (c, url) => { res.statusCode = c; res.headers.location = url; return res; };
    return res;
};
