import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../../server/social/service.js';
import { testConfig, makeStore, mockFetch, noSleep, connectAll, LINK } from './helpers.js';

const SOCIAL_HOSTS = /graph\.facebook\.com|api\.linkedin\.com|googleapis\.com|upload\.youtube/;

const liveSite = () => mockFetch([
    [`GET ${LINK}`, () => ({ status: 200, body: '<html></html>' })],
]);

/**
 * End-to-end rehearsal in dry-run: new property -> 4 drafts -> approve ->
 * "publicado (dry-run)" with the payload that would have been sent, and not a
 * single request to a social network.
 */
test('E2E dry-run: alta -> 4 borradores -> aprobar -> publicado (dry-run) con payload', async () => {
    const store = makeStore();
    const fetch = liveSite();
    const service = createService({ store, config: testConfig(), fetch, sleep: noSleep });

    const created = await service.propertyPublished(501);
    assert.equal(created.created, true);
    assert.equal(created.generator, 'plantilla');
    assert.equal(created.posts.length, 4);
    assert.deepEqual(created.posts.map(p => p.network).sort(), ['facebook', 'instagram', 'linkedin', 'youtube']);
    for (const p of created.posts) {
        assert.equal(p.status, 'pendiente');
        assert.equal(p.link, LINK);
    }

    // Same event twice: idempotent.
    const again = await service.propertyPublished(501);
    assert.equal(again.created, false);
    assert.equal(store.posts.size, 4);

    // YouTube needs the rendered videos; the worker reports them.
    await service.workerDone(501, { ok: true, ig: ['ig/01.jpg', 'ig/02.jpg', 'ig/03.jpg'], web: ['web/01.jpg', 'web/02.jpg', 'web/03.jpg'] });

    for (const p of await store.postsForProperty(501)) {
        const result = await service.approve(p.id, 'admin@azimutproperty.com');
        assert.equal(result.published, true, `${p.network}: ${JSON.stringify(result)}`);
        assert.equal(result.dryRun, true);
        assert.equal(result.post.status, 'publicado');
        assert.equal(result.post.dry_run, true);
        assert.equal(result.post.external_id, null);
        assert.ok(result.post.payload, 'payload recorded');
        assert.equal(result.post.approved_by, 'admin@azimutproperty.com');
    }
    const byNetwork = Object.fromEntries((await store.postsForProperty(501)).map(p => [p.network, p]));
    assert.equal(byNetwork.instagram.payload.containers.length, 4, '3 carousel items + carousel');
    assert.match(byNetwork.instagram.payload.containers[0].body.image_url, /\/p501\/ig\/01\.jpg$/);
    assert.equal(byNetwork.youtube.payload.uploads.length, 2);
    assert.match(byNetwork.linkedin.payload.post.body.commentary, /\{hashtag\|\\#\|/);
    assert.equal(store.attempts.length, 4);
    assert.ok(store.attempts.every(a => a.ok && a.dry_run));

    assert.ok(!fetch.calls.some(c => SOCIAL_HOSTS.test(c.url)), 'dry-run never calls a social network');
});

test('approve waits (stays "aprobado") while the property page is not deployed', async () => {
    const store = makeStore();
    const fetch = mockFetch([[`GET ${LINK}`, () => ({ status: 404 })]]);
    const service = createService({ store, config: testConfig(), fetch, sleep: noSleep });
    const { posts } = await service.propertyPublished(501);
    const fb = posts.find(p => p.network === 'facebook');
    const r = await service.approve(fb.id, 'admin@azimutproperty.com');
    assert.equal(r.waiting, 'deploy');
    assert.equal((await store.getPost(fb.id)).status, 'aprobado');
});

test('a second approve of a published draft is refused (no double post)', async () => {
    const store = makeStore();
    const service = createService({ store, config: testConfig(), fetch: liveSite(), sleep: noSleep });
    const { posts } = await service.propertyPublished(501);
    const li = posts.find(p => p.network === 'linkedin');
    await service.approve(li.id, 'a');
    await assert.rejects(service.approve(li.id, 'a'), /ya está publicado/);
    await assert.rejects(service.publish(li.id), /estado "publicado"/);
});

test('reject, and edits only reorder/drop known media', async () => {
    const store = makeStore();
    const service = createService({ store, config: testConfig(), fetch: liveSite(), sleep: noSleep });
    const { posts } = await service.propertyPublished(501);
    const fb = posts.find(p => p.network === 'facebook');
    const edited = await service.updateDraft(fb.id, {
        body: 'Nuevo texto', hashtags: '#Lujo ronda',
        media: [{ url: fb.media[1].url }, { url: 'https://evil.test/x.jpg' }],
    });
    assert.equal(edited.body, 'Nuevo texto');
    assert.deepEqual(edited.hashtags, ['Lujo', 'ronda']);
    assert.deepEqual(edited.media.map(m => m.url), [fb.media[1].url]);
    const rejected = await service.reject(fb.id);
    assert.equal(rejected.status, 'rechazado');
    await assert.rejects(service.updateDraft(fb.id, { body: 'x' }), /No se puede editar/);
});

test('real mode: missing account keeps the draft waiting; with account it publishes and records the id', async () => {
    const store = makeStore();
    let n = 0;
    const fetch = mockFetch([
        [`GET ${LINK}`, () => ({ status: 200 })],
        ['POST https://graph.facebook.com/v26.0/PAGE1/photos', () => ({ body: { id: `PH${++n}` } })],
        ['POST https://graph.facebook.com/v26.0/PAGE1/feed', () => ({ body: { id: 'PAGE1_42' } })],
    ]);
    const config = testConfig({ dryRun: false });
    const service = createService({ store, config, fetch, sleep: noSleep });
    const { posts } = await service.propertyPublished(501);
    await service.workerDone(501, { ok: true, ig: ['ig/01.jpg'], web: ['web/01.jpg', 'web/02.jpg'] });
    const fb = posts.find(p => p.network === 'facebook');

    const waiting = await service.approve(fb.id, 'a');
    assert.equal(waiting.waiting, 'account');

    await connectAll(store);
    const done = await service.publish(fb.id);
    assert.equal(done.published, true);
    assert.equal(done.post.external_id, 'PAGE1_42');
    assert.equal(done.post.dry_run, false);
    const photo = new URLSearchParams(fetch.calls.find(c => c.url.endsWith('/photos')).init.body.toString());
    assert.equal(photo.get('access_token'), 'facebook-token', 'decrypted token is what gets sent');
});

test('real mode: a platform error marks "error", logs the attempt, and retry works', async () => {
    const store = makeStore();
    let fail = true;
    const fetch = mockFetch([
        [`GET ${LINK}`, () => ({ status: 200 })],
        ['POST https://graph.facebook.com/v26.0/PAGE1/photos', () => (fail ? { status: 400, body: { error: { message: 'Invalid image' } } } : { body: { id: 'PH' } })],
        ['POST https://graph.facebook.com/v26.0/PAGE1/feed', () => ({ body: { id: 'PAGE1_7' } })],
    ]);
    const service = createService({ store, config: testConfig({ dryRun: false }), fetch, sleep: noSleep });
    await connectAll(store);
    const { posts } = await service.propertyPublished(501);
    await service.workerDone(501, { ok: true, ig: ['ig/01.jpg'], web: ['web/01.jpg'] });
    const fb = posts.find(p => p.network === 'facebook');

    const failed = await service.approve(fb.id, 'a');
    assert.equal(failed.published, false);
    assert.equal(failed.post.status, 'error');
    assert.match(failed.post.last_error, /Invalid image/);
    assert.equal(store.attempts.at(-1).http_status, 400);

    fail = false;
    const retried = await service.publish(fb.id);
    assert.equal(retried.post.status, 'publicado');
    assert.equal(retried.post.attempts, 2);
});

test('worker job hands out signed uploads; failure marks media as error', async () => {
    const store = makeStore();
    const service = createService({ store, config: testConfig(), fetch: liveSite(), sleep: noSleep });
    const job = await service.workerJob(501);
    assert.equal(job.photos.length, 3, 'plans are never included');
    assert.equal(job.property.price, '1.800.000 €');
    assert.ok(job.uploads['ig/03.jpg'] && job.uploads['video/short.mp4']);

    await service.propertyPublished(501);
    await service.workerDone(501, { ok: false, error: 'ffmpeg exploded' });
    for (const p of await store.postsForProperty(501)) {
        assert.equal(p.media_status, 'error');
        assert.match(p.last_error, /ffmpeg exploded/);
    }
});

test('accounts() reports state without ever returning tokens', async () => {
    const store = makeStore();
    await connectAll(store);
    const service = createService({ store, config: testConfig(), fetch: liveSite(), sleep: noSleep });
    const out = await service.accounts();
    assert.equal(out.dryRun, true);
    assert.equal(out.accounts.length, 4);
    assert.ok(!JSON.stringify(out).includes('token_enc'));
    assert.ok(!JSON.stringify(out).includes('-token'));
});
