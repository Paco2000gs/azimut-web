import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../../server/social/router.js';
import { signState } from '../../server/social/crypto.js';
import { testConfig, makeStore, mockFetch, mockRes, noSleep } from './helpers.js';

const call = async ({ method = 'GET', route, token, body, query = {} }, deps) => {
    const res = mockRes();
    await handle({
        method, url: `/api/social/${route}`, query: { route, ...query }, body,
        headers: token ? { authorization: `Bearer ${token}` } : {},
    }, res, deps);
    return res;
};

const deps = () => ({ config: testConfig(), store: makeStore(), fetch: mockFetch([]), sleep: noSleep });

test('admin routes need a Supabase session whose email is in ADMIN_EMAILS', async () => {
    const d = deps();
    assert.equal((await call({ route: 'posts' }, d)).statusCode, 401);
    assert.equal((await call({ route: 'posts', token: 'other-jwt' }, d)).statusCode, 401);
    const ok = await call({ route: 'posts', token: 'admin-jwt' }, d);
    assert.equal(ok.statusCode, 200);
    assert.deepEqual(ok.body, []);
});

test('worker and cron routes need their own secrets', async () => {
    const d = deps();
    assert.equal((await call({ route: 'worker/job', query: { property_id: '501' }, token: 'admin-jwt' }, d)).statusCode, 401);
    assert.equal((await call({ route: 'worker/job', query: { property_id: '501' }, token: 'worker-secret' }, d)).statusCode, 200);
    assert.equal((await call({ route: 'cron', token: 'worker-secret' }, d)).statusCode, 401);
    assert.equal((await call({ route: 'cron', token: 'cron-secret' }, d)).statusCode, 200);
});

test('property-published over HTTP creates the 4 drafts', async () => {
    const d = deps();
    const res = await call({ method: 'POST', route: 'property-published', token: 'admin-jwt', body: { propertyId: 501 } }, d);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.posts.length, 4);
    const missing = await call({ method: 'POST', route: 'property-published', token: 'admin-jwt', body: { propertyId: 9 } }, d);
    assert.equal(missing.statusCode, 404);
});

test('oauth start returns the provider URL with a signed state', async () => {
    const res = await call({ method: 'POST', route: 'oauth/linkedin/start', token: 'admin-jwt' }, deps());
    const url = new URL(res.body.url);
    assert.equal(url.host, 'www.linkedin.com');
    assert.equal(url.searchParams.get('scope'), 'w_organization_social');
    assert.equal(url.searchParams.get('redirect_uri'), 'https://www.azimutproperty.com/api/social/oauth/linkedin/callback');
    assert.ok(url.searchParams.get('state'));
});

test('oauth callback: bad state is rejected; good state stores encrypted tokens', async () => {
    const d = deps();
    const bad = await call({ route: 'oauth/google/callback', query: { code: 'c', state: 'forged' } }, d);
    assert.equal(bad.statusCode, 302);
    assert.match(bad.headers.location, /oauth_error=/);

    d.fetch = mockFetch([
        ['POST https://oauth2.googleapis.com/token', () => ({ body: { access_token: 'ya29', refresh_token: '1//refresh', scope: 'https://www.googleapis.com/auth/youtube.upload' } })],
    ]);
    const state = signState({ p: 'google', e: 'admin@azimutproperty.com' }, 'state-secret');
    const good = await call({ route: 'oauth/google/callback', query: { code: 'c', state } }, d);
    assert.match(good.headers.location, /connected=youtube/);
    const row = await d.store.getAccount('youtube');
    assert.ok(row.refresh_token_enc && !row.refresh_token_enc.includes('refresh'));
});

test('oauth callback: Meta stores Page token for Facebook and Instagram', async () => {
    const d = deps();
    d.fetch = mockFetch([
        [/oauth\/access_token\?client_id/, () => ({ body: { access_token: 'short' } })],
        [/oauth\/access_token\?grant_type=fb_exchange_token/, () => ({ body: { access_token: 'long' } })],
        [/\/me\/accounts/, () => ({ body: { data: [{ id: 'PAGE1', name: 'Azimut Property', access_token: 'page-token', instagram_business_account: { id: 'IG1', username: 'azimutproperty' } }] } })],
    ]);
    const state = signState({ p: 'meta', e: 'admin@azimutproperty.com' }, 'state-secret');
    const res = await call({ route: 'oauth/meta/callback', query: { code: 'c', state } }, d);
    assert.match(res.headers.location, /connected=facebook%2Cinstagram/);
    assert.equal((await d.store.getAccount('instagram')).account_name, '@azimutproperty');
});
