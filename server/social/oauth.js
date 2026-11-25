/* eslint-env node */
import { encrypt, signState, verifyState } from './crypto.js';
import { request, form } from './http.js';
import { ServiceError } from './service.js';

/**
 * OAuth for the three providers. Paco signs in on each provider's own page;
 * this code only ever sees the authorization code and the resulting tokens,
 * which are encrypted before they touch the database.
 *
 *   meta     -> facebook (Page token) + instagram (same Page token)
 *   linkedin -> linkedin (organization)
 *   google   -> youtube
 */
export const PROVIDERS = ['meta', 'linkedin', 'google'];

const SCOPES = {
    meta: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'instagram_basic', 'instagram_content_publish'],
    linkedin: ['w_organization_social'],
    google: ['https://www.googleapis.com/auth/youtube.upload'],
};

export const redirectUri = (config, provider) => `${config.siteUrl}/api/social/oauth/${provider}/callback`;

export const authorizeUrl = (config, provider, email) => {
    if (!PROVIDERS.includes(provider)) throw new ServiceError('Proveedor desconocido', 404);
    const state = signState({ p: provider, e: email }, config.oauthStateSecret);
    const redirect = redirectUri(config, provider);
    let url;
    if (provider === 'meta') {
        if (!config.meta.appId) throw new ServiceError('META_APP_ID no está configurado');
        url = new URL(`https://www.facebook.com/${config.meta.graphVersion}/dialog/oauth`);
        url.search = new URLSearchParams({ client_id: config.meta.appId, redirect_uri: redirect, state, response_type: 'code', scope: SCOPES.meta.join(',') });
    } else if (provider === 'linkedin') {
        if (!config.linkedin.clientId) throw new ServiceError('LINKEDIN_CLIENT_ID no está configurado');
        url = new URL('https://www.linkedin.com/oauth/v2/authorization');
        url.search = new URLSearchParams({ response_type: 'code', client_id: config.linkedin.clientId, redirect_uri: redirect, state, scope: SCOPES.linkedin.join(' ') });
    } else {
        if (!config.google.clientId) throw new ServiceError('GOOGLE_CLIENT_ID no está configurado');
        url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        url.search = new URLSearchParams({
            client_id: config.google.clientId, redirect_uri: redirect, response_type: 'code', state,
            scope: SCOPES.google.join(' '), access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true',
        });
    }
    return url.toString();
};

const expiresAt = (now, seconds) => (seconds ? new Date(now.getTime() + Number(seconds) * 1000).toISOString() : null);

/** Exchange the code, store encrypted tokens. Returns the networks connected. */
export const handleCallback = async ({ config, store, fetchImpl = fetch, provider, code, state, now = new Date() }) => {
    const data = verifyState(state, config.oauthStateSecret, now.getTime());
    if (!data || data.p !== provider) throw new ServiceError('Estado OAuth inválido o caducado. Vuelve a pulsar «Conectar».', 400);
    if (!config.adminEmails.includes(String(data.e || '').toLowerCase())) throw new ServiceError('No autorizado', 403);
    if (!code) throw new ServiceError('El proveedor no devolvió código de autorización', 400);
    const enc = (v) => encrypt(v, config.tokenEncKey);
    const redirect = redirectUri(config, provider);

    if (provider === 'meta') {
        const g = `https://graph.facebook.com/${config.meta.graphVersion}`;
        const short = await request(fetchImpl, `${g}/oauth/access_token?${new URLSearchParams({
            client_id: config.meta.appId, client_secret: config.meta.appSecret, redirect_uri: redirect, code,
        })}`, {}, { label: 'meta code exchange', retries: 1 });
        const long = await request(fetchImpl, `${g}/oauth/access_token?${new URLSearchParams({
            grant_type: 'fb_exchange_token', client_id: config.meta.appId, client_secret: config.meta.appSecret, fb_exchange_token: short.body.access_token,
        })}`, {}, { label: 'meta long-lived exchange', retries: 1 });
        // Page tokens obtained with a long-lived user token have no expiry date.
        const pages = await request(fetchImpl, `${g}/me/accounts?${new URLSearchParams({
            fields: 'id,name,access_token,instagram_business_account{id,username}', access_token: long.body.access_token,
        })}`, {}, { label: 'meta pages', retries: 1 });
        const list = pages.body?.data || [];
        const page = (config.meta.pageId ? list.find(p => p.id === config.meta.pageId) : list[0]);
        if (!page) throw new ServiceError('No se encontró ninguna página de Facebook administrada por esta cuenta', 422);

        const connected = ['facebook'];
        await store.saveAccount({ network: 'facebook', account_id: page.id, account_name: page.name, access_token_enc: enc(page.access_token), refresh_token_enc: null, token_expires_at: null, refresh_expires_at: null, scopes: SCOPES.meta });
        const ig = page.instagram_business_account;
        if (ig?.id) {
            await store.saveAccount({ network: 'instagram', account_id: ig.id, account_name: ig.username ? `@${ig.username}` : ig.id, access_token_enc: enc(page.access_token), refresh_token_enc: null, token_expires_at: null, refresh_expires_at: null, scopes: SCOPES.meta });
            connected.push('instagram');
        }
        return connected;
    }

    if (provider === 'linkedin') {
        if (!config.linkedin.organizationId) throw new ServiceError('Falta LINKEDIN_ORGANIZATION_ID', 400);
        const res = await request(fetchImpl, 'https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            body: form({ grant_type: 'authorization_code', code, redirect_uri: redirect, client_id: config.linkedin.clientId, client_secret: config.linkedin.clientSecret }),
        }, { label: 'linkedin code exchange', retries: 1 });
        const t = res.body;
        await store.saveAccount({
            network: 'linkedin',
            account_id: `urn:li:organization:${config.linkedin.organizationId}`,
            account_name: 'Página de empresa',
            access_token_enc: enc(t.access_token),
            refresh_token_enc: t.refresh_token ? enc(t.refresh_token) : null,
            token_expires_at: expiresAt(now, t.expires_in),
            refresh_expires_at: expiresAt(now, t.refresh_token_expires_in),
            scopes: String(t.scope || SCOPES.linkedin.join(' ')).split(/[ ,]+/),
        });
        return ['linkedin'];
    }

    const res = await request(fetchImpl, 'https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: form({ code, client_id: config.google.clientId, client_secret: config.google.clientSecret, redirect_uri: redirect, grant_type: 'authorization_code' }),
    }, { label: 'google code exchange', retries: 1 });
    if (!res.body?.refresh_token) {
        throw new ServiceError('Google no devolvió refresh_token. Quita el acceso de la app en tu cuenta de Google y vuelve a conectar.', 422);
    }
    await store.saveAccount({
        network: 'youtube',
        account_id: 'mine',
        account_name: 'Canal de YouTube',
        access_token_enc: enc(res.body.access_token),
        refresh_token_enc: enc(res.body.refresh_token),
        // Access tokens last an hour and are re-minted on every publish; the
        // refresh token has no fixed expiry once the app is "In production".
        token_expires_at: null,
        refresh_expires_at: null,
        scopes: String(res.body.scope || '').split(' ').filter(Boolean),
    });
    return ['youtube'];
};
