/* eslint-env node */
import { getConfig } from './config.js';
import { safeEqual } from './crypto.js';
import { createSupabaseStore } from './store.js';
import { createService, ServiceError } from './service.js';
import { authorizeUrl, handleCallback } from './oauth.js';

const bearer = (req) => {
    const h = req.headers?.authorization || '';
    return h.startsWith('Bearer ') ? h.slice(7) : '';
};

/** Route segments from the rewrite (?route=posts/12/approve) or the raw URL. */
const routeOf = (req) => {
    const fromQuery = req.query?.route;
    const raw = Array.isArray(fromQuery) ? fromQuery.join('/') : fromQuery
        || new URL(req.url, 'http://x').pathname.replace(/^\/api\/social\/?/, '');
    return String(raw || '').split('/').filter(Boolean);
};

const readBody = (req) => {
    try {
        const b = req.body;
        if (!b) return {};
        return typeof b === 'string' ? JSON.parse(b) : b;
    } catch {
        throw new ServiceError('JSON inválido', 400);
    }
};

/**
 * Single entry point for /api/social/* (one Vercel Function, routed here).
 * deps are injectable for tests: { config, store, fetch, sleep }.
 */
export const handle = async (req, res, deps = {}) => {
    const config = deps.config || getConfig();
    const send = (status, body) => res.status(status).json(body);
    try {
        const store = deps.store || createSupabaseStore(config);
        const service = createService({ store, config, fetch: deps.fetch || fetch, sleep: deps.sleep });
        const [a, b, c] = routeOf(req);
        const method = req.method;

        // --- Machine callers (own secrets) ------------------------------
        if (a === 'cron') {
            if (!config.cronSecret || !safeEqual(bearer(req), config.cronSecret)) return send(401, { error: 'No autorizado' });
            return send(200, await service.cron());
        }
        if (a === 'worker') {
            if (!config.worker.secret || !safeEqual(bearer(req), config.worker.secret)) return send(401, { error: 'No autorizado' });
            if (b === 'job' && method === 'GET') return send(200, await service.workerJob(Number(req.query.property_id)));
            if (b === 'done' && method === 'POST') {
                const body = readBody(req);
                return send(200, await service.workerDone(Number(body.property_id), body));
            }
            return send(404, { error: 'Ruta no encontrada' });
        }
        if (a === 'oauth' && c === 'callback' && method === 'GET') {
            const back = new URL('/admin', config.siteUrl);
            try {
                if (req.query.error) throw new ServiceError(String(req.query.error_description || req.query.error));
                const connected = await handleCallback({ config, store, fetchImpl: deps.fetch || fetch, provider: b, code: req.query.code, state: req.query.state });
                back.search = new URLSearchParams({ tab: 'social', connected: connected.join(',') });
            } catch (err) {
                back.search = new URLSearchParams({ tab: 'social', oauth_error: err.message });
            }
            return res.redirect(302, back.toString());
        }

        // --- Admin (Supabase session + allow-list) -----------------------
        const user = await store.getUserFromJwt(bearer(req));
        const email = String(user?.email || '').toLowerCase();
        if (!user || !config.adminEmails.includes(email)) {
            // TEMP diagnostic (remove after fixing the preview 401). No secret values are logged.
            console.warn('[social-401]', JSON.stringify({
                userFound: !!user,
                email,
                adminEmailsRaw: process.env.ADMIN_EMAILS ?? null,
                adminEmails: config.adminEmails,
                supabaseUrl: config.supabaseUrl,
                serviceKeyLength: config.supabaseServiceKey.length,
            }));
            return send(401, { error: 'No autorizado' });
        }

        if (a === 'property-published' && method === 'POST') {
            const { propertyId } = readBody(req);
            return send(200, await service.propertyPublished(Number(propertyId)));
        }
        if (a === 'accounts' && method === 'GET') return send(200, await service.accounts());
        if (a === 'oauth' && c === 'start' && method === 'POST') return send(200, { url: authorizeUrl(config, b, email) });
        if (a === 'properties' && c === 'media' && method === 'POST') return send(200, await service.regenerateMedia(Number(b)));
        if (a === 'posts') {
            if (!b && method === 'GET') return send(200, await service.listPosts({ status: req.query.status || undefined }));
            const id = Number(b);
            if (!c && method === 'GET') return send(200, await service.getPost(id));
            if (!c && method === 'PATCH') return send(200, await service.updateDraft(id, readBody(req)));
            if (c === 'approve' && method === 'POST') return send(200, await service.approve(id, email));
            if (c === 'publish' && method === 'POST') return send(200, await service.publish(id));
            if (c === 'reject' && method === 'POST') return send(200, await service.reject(id));
        }
        return send(404, { error: 'Ruta no encontrada' });
    } catch (err) {
        const status = err instanceof ServiceError ? err.status : 500;
        if (status >= 500) console.error('[social]', err);
        return send(status, { error: err.message });
    }
};
