/* eslint-env node */
import { NETWORKS } from './config.js';
import { LIMITS } from './limits.js';
import { decrypt, encrypt } from './crypto.js';
import { generateCopy } from './copy.js';
import { propertyLink, pickPhotos, formatPrice } from './property.js';
import { normalizeHashtags } from './text.js';
import { request, form } from './http.js';
import { getAdapter } from './adapters/index.js';

export class ServiceError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

const EDITABLE = ['pendiente', 'aprobado', 'error'];
const DAY = 24 * 60 * 60 * 1000;

const mediaPrefix = (propertyId) => `p${propertyId}`;
const pad = (n) => String(n).padStart(2, '0');

/**
 * The whole draft → approval → publish lifecycle. Every external effect
 * (database, HTTP, clock) is injected so tests run it end to end in memory.
 */
export const createService = ({ store, config, fetch: fetchImpl = fetch, sleep, now = () => new Date() }) => {
    const iso = () => now().toISOString();
    const workerConfigured = () => Boolean(config.worker.token && config.worker.secret);

    const loadAccount = async (network) => {
        const row = await store.getAccount(network);
        if (!row) return null;
        return {
            ...row,
            access_token: decrypt(row.access_token_enc, config.tokenEncKey),
            refresh_token: row.refresh_token_enc ? decrypt(row.refresh_token_enc, config.tokenEncKey) : null,
        };
    };

    const linkIsLive = async (url) => {
        try {
            const res = await fetchImpl(url, { method: 'GET', redirect: 'follow' });
            return res.status === 200;
        } catch {
            return false;
        }
    };

    const triggerDeploy = async () => {
        if (!config.deployHookUrl) return 'no-configurado';
        try {
            await request(fetchImpl, config.deployHookUrl, { method: 'POST' }, { sleep, label: 'deploy hook', retries: 1 });
            return 'lanzado';
        } catch (err) {
            return `error: ${err.message}`;
        }
    };

    const dispatchWorker = async (propertyId) => {
        const { repo, workflow, ref, token } = config.worker;
        await request(fetchImpl, `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ref, inputs: { property_id: String(propertyId) } }),
        }, { sleep, label: 'github workflow_dispatch', retries: 1 });
    };

    const startMedia = async (propertyId) => {
        if (!workerConfigured()) return false;
        for (const network of NETWORKS) {
            await store.updatePostsForProperty(propertyId, network, { media_status: 'generando' });
        }
        try {
            await dispatchWorker(propertyId);
            return true;
        } catch (err) {
            for (const network of NETWORKS) {
                await store.updatePostsForProperty(propertyId, network, { media_status: 'error', last_error: `No se pudo lanzar el worker de media: ${err.message}` });
            }
            return false;
        }
    };

    const service = {
        /** Event "property published": 4 drafts, idempotent per property. */
        async propertyPublished(propertyId) {
            const property = await store.getProperty(propertyId);
            if (!property) throw new ServiceError('Propiedad no encontrada', 404);

            const existing = await store.postsForProperty(property.id);
            if (existing.length >= NETWORKS.length) return { created: false, posts: existing };

            const deploy = await triggerDeploy();
            const link = propertyLink(config.siteUrl, property);
            const copy = await generateCopy({ property, link, config, fetchImpl });
            const photos = pickPhotos(property, 12).map((url, i) => ({ url, alt: `${property.title} — foto ${i + 1}` }));

            // Without the worker, a dry-run rehearsal still gets a complete
            // draft from the original photos. Real publishing never does:
            // originals can be WebP, which Instagram/Facebook/LinkedIn reject.
            const provisionalReady = !workerConfigured() && config.dryRun;
            const rows = NETWORKS.map(network => ({
                property_id: property.id,
                network,
                status: 'pendiente',
                title: copy.drafts[network].title || null,
                body: copy.drafts[network].body,
                hashtags: copy.drafts[network].hashtags,
                link,
                media: network === 'youtube' ? [] : photos.slice(0, LIMITS[network].maxImages),
                media_status: provisionalReady && network !== 'youtube' ? 'listo' : 'pendiente',
                last_error: copy.error || null,
            }));
            await store.insertDrafts(rows);
            const mediaStarted = await startMedia(property.id);
            return {
                created: true,
                generator: copy.generator,
                deploy,
                media: mediaStarted ? 'generando' : 'worker-no-configurado',
                posts: await store.postsForProperty(property.id),
            };
        },

        async listPosts(filter = {}) {
            return store.listPosts(filter);
        },

        async getPost(id) {
            const post = await store.getPost(id);
            if (!post) throw new ServiceError('Borrador no encontrado', 404);
            return { ...post, attempts_log: await store.listAttempts(id), validation: getAdapter(post.network).validate(post) };
        },

        async updateDraft(id, edits = {}) {
            const post = await store.getPost(id);
            if (!post) throw new ServiceError('Borrador no encontrado', 404);
            const patch = {};
            if (typeof edits.title === 'string') patch.title = edits.title;
            if (typeof edits.body === 'string') patch.body = edits.body;
            if (edits.hashtags !== undefined) {
                const list = Array.isArray(edits.hashtags) ? edits.hashtags : String(edits.hashtags).split(/[\s,]+/);
                patch.hashtags = normalizeHashtags(list);
            }
            if (Array.isArray(edits.media)) {
                // Reorder or drop only: a URL the draft never had cannot be smuggled in.
                const known = new Map((post.media || []).map(m => [m.url, m]));
                patch.media = edits.media.map(m => known.get(m.url || m)).filter(Boolean);
            }
            const updated = await store.updatePost(id, patch, { fromStatuses: EDITABLE });
            if (!updated) throw new ServiceError(`No se puede editar un borrador en estado "${post.status}"`, 409);
            return updated;
        },

        async reject(id) {
            const updated = await store.updatePost(id, { status: 'rechazado' }, { fromStatuses: EDITABLE });
            if (!updated) throw new ServiceError('Solo se pueden rechazar borradores pendientes, aprobados o con error', 409);
            return updated;
        },

        async approve(id, approvedBy) {
            const updated = await store.updatePost(id, { status: 'aprobado', approved_at: iso(), approved_by: approvedBy || null }, { fromStatuses: EDITABLE });
            if (!updated) throw new ServiceError('Este borrador ya está publicado, publicándose o rechazado', 409);
            return service.publish(id);
        },

        /**
         * Publish an approved (or failed) draft. Pre-flight problems that time
         * fixes on its own (deploy not finished, media still rendering) leave
         * it "aprobado" so the cron or a later click picks it up.
         */
        async publish(id) {
            const post = await store.getPost(id);
            if (!post) throw new ServiceError('Borrador no encontrado', 404);
            if (!['aprobado', 'error'].includes(post.status)) {
                throw new ServiceError(`No se puede publicar un borrador en estado "${post.status}"`, 409);
            }
            const adapter = getAdapter(post.network);
            const wait = async (reason, message) => {
                const updated = await store.updatePost(id, { status: 'aprobado', last_error: message }, { fromStatuses: ['aprobado', 'error'] });
                return { waiting: reason, post: updated };
            };

            if (post.media_status !== 'listo') return wait('media', 'Esperando a que termine la preparación de fotos y vídeo.');
            const errors = adapter.validate(post);
            if (errors.length) {
                const updated = await store.updatePost(id, { status: 'error', last_error: errors.join(' ') }, { fromStatuses: ['aprobado', 'error'] });
                return { invalid: errors, post: updated };
            }
            if (!await linkIsLive(post.link)) return wait('deploy', 'Esperando despliegue: la ficha todavía no responde 200.');

            const account = await loadAccount(post.network);
            if (!config.dryRun) {
                if (!account) return wait('account', `La cuenta de ${post.network} no está conectada.`);
                if (account.token_expires_at && new Date(account.token_expires_at) <= now()) {
                    return wait('account', `El token de ${post.network} ha caducado. Vuelve a conectar la cuenta.`);
                }
            }

            const claimed = await store.updatePost(id, { status: 'publicando' }, { fromStatuses: ['aprobado', 'error'] });
            if (!claimed) throw new ServiceError('Otra petición está publicando este borrador', 409);

            const attempts = (post.attempts || 0) + 1;
            try {
                const result = config.dryRun
                    ? { externalId: null, externalUrl: null, payload: adapter.buildPayload(post, account, config) }
                    : await adapter.publish(post, account, { fetch: fetchImpl, config, sleep });
                const extra = { ...(post.external_extra || {}), ...(result.extra || {}) };
                const updated = await store.updatePost(id, {
                    status: 'publicado',
                    dry_run: config.dryRun,
                    payload: result.payload,
                    external_id: result.externalId,
                    external_url: result.externalUrl,
                    external_extra: extra,
                    published_at: iso(),
                    attempts,
                    last_error: extra.warning || null,
                });
                await store.addAttempt({ post_id: post.id, dry_run: config.dryRun, ok: true, response: { externalId: result.externalId, externalUrl: result.externalUrl } });
                if (!config.dryRun && post.network === 'youtube') {
                    await store.removeFiles([`${mediaPrefix(post.property_id)}/video/video.mp4`, `${mediaPrefix(post.property_id)}/video/short.mp4`]).catch(() => {});
                }
                return { published: true, dryRun: config.dryRun, post: updated };
            } catch (err) {
                const patch = { status: 'error', last_error: err.message, attempts };
                if (err.partial) {
                    patch.external_id = err.partial.externalId;
                    patch.external_url = err.partial.externalUrl;
                    patch.external_extra = { ...(post.external_extra || {}), ...err.partial.extra };
                }
                const updated = await store.updatePost(id, patch);
                await store.addAttempt({ post_id: post.id, dry_run: config.dryRun, ok: false, http_status: err.status || null, error: err.message, response: typeof err.body === 'object' ? err.body : null });
                return { published: false, error: err.message, post: updated };
            }
        },

        async regenerateMedia(propertyId) {
            if (!workerConfigured()) throw new ServiceError('El worker de media no está configurado (GITHUB_DISPATCH_TOKEN / VIDEO_WORKER_SECRET)', 400);
            return { started: await startMedia(propertyId) };
        },

        /** Worker asks what to render and where to upload it. */
        async workerJob(propertyId) {
            const property = await store.getProperty(propertyId);
            if (!property) throw new ServiceError('Propiedad no encontrada', 404);
            const photos = pickPhotos(property, 12);
            if (!photos.length) throw new ServiceError('La propiedad no tiene fotos', 422);
            const prefix = mediaPrefix(property.id);
            const keys = [
                ...photos.map((_, i) => `ig/${pad(i + 1)}.jpg`),
                ...photos.map((_, i) => `web/${pad(i + 1)}.jpg`),
                'video/video.mp4',
                'video/short.mp4',
            ];
            const uploads = {};
            for (const key of keys) uploads[key] = await store.signedUpload(`${prefix}/${key}`);
            return {
                property: {
                    id: property.id,
                    title: property.title,
                    type: property.type,
                    location: [property.city, property.province].filter(Boolean).join(', '),
                    price: formatPrice(property),
                    link: propertyLink(config.siteUrl, property),
                },
                logo_url: `${config.siteUrl}/azimut-logo-gold.png`,
                photos,
                uploads,
            };
        },

        /** Worker reports what it uploaded; drafts get their final media. */
        async workerDone(propertyId, result = {}) {
            const property = await store.getProperty(propertyId);
            if (!property) throw new ServiceError('Propiedad no encontrada', 404);
            const prefix = mediaPrefix(property.id);
            const posts = await store.postsForProperty(property.id);
            const open = posts.filter(p => !['publicado', 'publicando'].includes(p.status));

            if (!result.ok) {
                for (const p of open) await store.updatePost(p.id, { media_status: 'error', last_error: `Error al generar fotos/vídeo: ${result.error || 'desconocido'}` });
                return { updated: open.length };
            }

            const toMedia = (keys) => (keys || []).map((key, i) => ({ url: store.publicUrl(`${prefix}/${key}`), alt: `${property.title} — foto ${i + 1}` }));
            const media = {
                instagram: toMedia(result.ig).slice(0, LIMITS.instagram.maxImages),
                facebook: toMedia(result.web).slice(0, LIMITS.facebook.maxImages),
                linkedin: toMedia(result.web).slice(0, LIMITS.linkedin.maxImages),
            };
            for (const p of open) {
                const patch = { media_status: 'listo' };
                if (p.network === 'youtube') {
                    patch.video = { video_url: store.publicUrl(`${prefix}/video/video.mp4`), short_url: store.publicUrl(`${prefix}/video/short.mp4`) };
                } else {
                    patch.media = media[p.network];
                }
                await store.updatePost(p.id, patch);
            }
            return { updated: open.length };
        },

        async accounts() {
            const rows = await store.listAccounts();
            const soon = now().getTime() + 10 * DAY;
            return {
                dryRun: config.dryRun,
                worker: workerConfigured(),
                ai: Boolean(config.gemini.apiKey),
                accounts: NETWORKS.map(network => {
                    const row = rows.find(r => r.network === network);
                    if (!row) return { network, connected: false };
                    const exp = row.token_expires_at ? new Date(row.token_expires_at).getTime() : null;
                    return {
                        network,
                        connected: true,
                        account_id: row.account_id,
                        account_name: row.account_name,
                        token_expires_at: row.token_expires_at,
                        refresh_expires_at: row.refresh_expires_at,
                        expired: exp !== null && exp <= now().getTime(),
                        expires_soon: exp !== null && exp <= soon,
                    };
                }),
            };
        },

        /** Daily: refresh tokens, retry drafts waiting on deploy/media, clean storage. */
        async cron() {
            const report = { tokens: [], published: [], cleaned: [] };

            const li = await loadAccount('linkedin');
            if (li?.refresh_token && li.token_expires_at && new Date(li.token_expires_at).getTime() <= now().getTime() + 10 * DAY) {
                try {
                    const res = await request(fetchImpl, 'https://www.linkedin.com/oauth/v2/accessToken', {
                        method: 'POST',
                        body: form({ grant_type: 'refresh_token', refresh_token: li.refresh_token, client_id: config.linkedin.clientId, client_secret: config.linkedin.clientSecret }),
                    }, { sleep, label: 'linkedin refresh' });
                    await store.saveAccount({
                        network: 'linkedin', account_id: li.account_id, account_name: li.account_name, scopes: li.scopes,
                        access_token_enc: encrypt(res.body.access_token, config.tokenEncKey),
                        refresh_token_enc: encrypt(res.body.refresh_token || li.refresh_token, config.tokenEncKey),
                        token_expires_at: new Date(now().getTime() + res.body.expires_in * 1000).toISOString(),
                        refresh_expires_at: res.body.refresh_token_expires_in
                            ? new Date(now().getTime() + res.body.refresh_token_expires_in * 1000).toISOString()
                            : li.refresh_expires_at,
                    });
                    report.tokens.push('linkedin: renovado');
                } catch (err) {
                    report.tokens.push(`linkedin: ${err.message}`);
                }
            }

            // Meta Page tokens don't expire on a date but can be invalidated
            // (password change, role removed). A cheap call tells us which.
            for (const network of ['facebook', 'instagram']) {
                const acc = await loadAccount(network);
                if (!acc) continue;
                try {
                    await request(fetchImpl, `https://graph.facebook.com/${config.meta.graphVersion}/${acc.account_id}?fields=id&access_token=${encodeURIComponent(acc.access_token)}`, {}, { sleep, label: `${network} token check`, retries: 1 });
                    report.tokens.push(`${network}: ok`);
                } catch (err) {
                    if (err.status === 400 || err.status === 401 || err.status === 403) {
                        await store.saveAccount({ ...stripTokens(acc), access_token_enc: acc.access_token_enc, refresh_token_enc: acc.refresh_token_enc, token_expires_at: now().toISOString() });
                    }
                    report.tokens.push(`${network}: ${err.message}`);
                }
            }

            for (const post of await store.listPosts({ status: 'aprobado' })) {
                const result = await service.publish(post.id).catch(err => ({ error: err.message }));
                report.published.push({ id: post.id, network: post.network, result: result.published ? 'publicado' : (result.waiting || result.error || 'error') });
            }

            const byProperty = new Map();
            for (const p of await store.listPosts()) {
                if (!byProperty.has(p.property_id)) byProperty.set(p.property_id, []);
                byProperty.get(p.property_id).push(p);
            }
            for (const [propertyId, posts] of byProperty) {
                const done = posts.every(p => ['publicado', 'rechazado'].includes(p.status));
                const last = Math.max(...posts.map(p => new Date(p.published_at || p.updated_at).getTime()));
                if (done && last < now().getTime() - 7 * DAY) {
                    const files = await store.listFiles(mediaPrefix(propertyId));
                    if (files.length) {
                        await store.removeFiles(files);
                        report.cleaned.push({ propertyId, files: files.length });
                    }
                }
            }
            return report;
        },
    };
    return service;
};

const stripTokens = ({ access_token: _a, refresh_token: _r, ...rest }) => rest;
