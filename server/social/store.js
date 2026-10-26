/* eslint-env node */
import { createClient } from '@supabase/supabase-js';

export const BUCKET = 'social';

const POST_LIST_FIELDS = '*, properties(id, title, city, province, type, image)';

const must = ({ data, error }) => {
    if (error) throw new Error(error.message);
    return data;
};

/**
 * Persistence for the social pipeline. Two implementations share this shape:
 * Supabase (production) and memory (tests / the dry-run end-to-end script).
 */
export const createSupabaseStore = (config) => {
    if (!config.supabaseUrl || !config.supabaseServiceKey) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
    }
    const db = createClient(config.supabaseUrl, config.supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    return {
        db,
        async getUserFromJwt(jwt) {
            const { data, error } = await db.auth.getUser(jwt);
            return error ? null : data.user;
        },
        async getProperty(id) {
            return must(await db.from('properties').select('*, property_media(id, url, type)').eq('id', id).maybeSingle());
        },
        async listPosts({ status } = {}) {
            let q = db.from('social_posts').select(POST_LIST_FIELDS).order('created_at', { ascending: false }).limit(200);
            if (status) q = q.eq('status', status);
            return must(await q);
        },
        async getPost(id) {
            return must(await db.from('social_posts').select(POST_LIST_FIELDS).eq('id', id).maybeSingle());
        },
        async postsForProperty(propertyId) {
            return must(await db.from('social_posts').select('*').eq('property_id', propertyId));
        },
        async insertDrafts(rows) {
            // Idempotent: a second "property published" event for the same
            // property never overwrites drafts someone may already be editing.
            must(await db.from('social_posts').upsert(rows, { onConflict: 'property_id,network', ignoreDuplicates: true }));
            return this.postsForProperty(rows[0].property_id);
        },
        /**
         * Update only if the row is still in one of `fromStatuses`. Returns
         * null when it isn't: that is the guard against a double click
         * publishing twice.
         */
        async updatePost(id, patch, { fromStatuses } = {}) {
            let q = db.from('social_posts').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
            if (fromStatuses) q = q.in('status', fromStatuses);
            const rows = must(await q.select());
            return rows[0] || null;
        },
        async updatePostsForProperty(propertyId, network, patch) {
            must(await db.from('social_posts').update({ ...patch, updated_at: new Date().toISOString() })
                .eq('property_id', propertyId).eq('network', network));
        },
        async addAttempt(row) {
            must(await db.from('social_post_attempts').insert(row));
        },
        async listAttempts(postId) {
            return must(await db.from('social_post_attempts').select('*').eq('post_id', postId).order('created_at', { ascending: false }));
        },
        async getAccount(network) {
            return must(await db.from('social_accounts').select('*').eq('network', network).maybeSingle());
        },
        async listAccounts() {
            return must(await db.from('social_accounts').select('*'));
        },
        async saveAccount(row) {
            must(await db.from('social_accounts').upsert({ ...row, updated_at: new Date().toISOString() }));
        },
        async signedUpload(path) {
            const data = must(await db.storage.from(BUCKET).createSignedUploadUrl(path, { upsert: true }));
            return data.signedUrl;
        },
        publicUrl(path) {
            return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
        },
        async removeFiles(paths) {
            if (!paths.length) return;
            must(await db.storage.from(BUCKET).remove(paths));
        },
        async listFiles(prefix) {
            const out = [];
            for (const sub of ['ig', 'web', 'video']) {
                const data = must(await db.storage.from(BUCKET).list(`${prefix}/${sub}`, { limit: 100 }));
                out.push(...data.filter(f => f.metadata).map(f => `${prefix}/${sub}/${f.name}`));
            }
            const top = must(await db.storage.from(BUCKET).list(prefix, { limit: 100 }));
            out.push(...top.filter(f => f.metadata).map(f => `${prefix}/${f.name}`));
            return out;
        },
    };
};

/** In-memory store with the same contract, for tests and dry-run rehearsals. */
export const createMemoryStore = ({ properties = [], users = {}, publicBase = 'https://storage.test/social' } = {}) => {
    const posts = new Map();
    const attempts = [];
    const accounts = new Map();
    const files = new Set();
    let seq = 1;
    const now = () => new Date().toISOString();
    const withProperty = (p) => {
        const prop = properties.find(x => x.id === p.property_id);
        return { ...p, properties: prop ? { id: prop.id, title: prop.title, city: prop.city, province: prop.province, type: prop.type, image: prop.image } : null };
    };

    return {
        posts, attempts, accounts, files,
        async getUserFromJwt(jwt) { return users[jwt] || null; },
        async getProperty(id) { return properties.find(p => p.id === Number(id)) || null; },
        async listPosts({ status } = {}) {
            return [...posts.values()].filter(p => !status || p.status === status).map(withProperty);
        },
        async getPost(id) { const p = posts.get(Number(id)); return p ? withProperty(p) : null; },
        // Copies, like rows from a real database: callers must not be able
        // to mutate stored state by holding on to a returned object.
        async postsForProperty(propertyId) { return [...posts.values()].filter(p => p.property_id === Number(propertyId)).map(p => structuredClone(p)); },
        async insertDrafts(rows) {
            for (const row of rows) {
                const exists = [...posts.values()].some(p => p.property_id === row.property_id && p.network === row.network);
                if (!exists) {
                    const id = seq++;
                    posts.set(id, {
                        id, created_at: now(), updated_at: now(), attempts: 0, hashtags: [], media: [], video: {},
                        external_extra: {}, media_status: 'pendiente', status: 'generando', ...row,
                    });
                }
            }
            return this.postsForProperty(rows[0].property_id);
        },
        async updatePost(id, patch, { fromStatuses } = {}) {
            const p = posts.get(Number(id));
            if (!p || (fromStatuses && !fromStatuses.includes(p.status))) return null;
            Object.assign(p, patch, { updated_at: now() });
            return { ...p };
        },
        async updatePostsForProperty(propertyId, network, patch) {
            for (const p of posts.values()) {
                if (p.property_id === Number(propertyId) && p.network === network) Object.assign(p, patch, { updated_at: now() });
            }
        },
        async addAttempt(row) { attempts.push({ id: attempts.length + 1, created_at: now(), ...row }); },
        async listAttempts(postId) { return attempts.filter(a => a.post_id === Number(postId)).reverse(); },
        async getAccount(network) { return accounts.get(network) || null; },
        async listAccounts() { return [...accounts.values()]; },
        async saveAccount(row) { accounts.set(row.network, { ...row, updated_at: now() }); },
        async signedUpload(path) { files.add(path); return `https://storage.test/upload/sign/social/${path}?token=t`; },
        publicUrl(path) { return `${publicBase}/${path}`; },
        async removeFiles(paths) { paths.forEach(p => files.delete(p)); },
        async listFiles(prefix) { return [...files].filter(f => f.startsWith(`${prefix}/`)); },
    };
};
