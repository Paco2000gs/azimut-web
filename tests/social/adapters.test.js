import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ADAPTERS } from '../../server/social/adapters/index.js';
import { testConfig, mockFetch, noSleep, LINK } from './helpers.js';

const config = testConfig();
const images = [
    { url: 'https://storage.test/social/p501/web/01.jpg', alt: 'Foto 1' },
    { url: 'https://storage.test/social/p501/web/02.jpg', alt: 'Foto 2' },
];
const draft = (network, extra = {}) => ({
    network, title: 'Villa en Ronda', body: 'Texto (con paréntesis)', hashtags: ['Villa', 'Ronda'], link: LINK,
    media: network === 'instagram' ? images.map(i => ({ ...i, url: i.url.replace('/web/', '/ig/') })) : images,
    video: { video_url: 'https://storage.test/social/p501/video/video.mp4', short_url: 'https://storage.test/social/p501/video/short.mp4' },
    external_extra: {},
    ...extra,
});
const ctx = (fetch) => ({ fetch, config, sleep: noSleep });
const jpeg = () => ({ body: new Uint8Array([0xff, 0xd8, 0xff]), headers: { 'content-type': 'image/jpeg' } });

test('validate(): formats and limits per network', () => {
    assert.deepEqual(ADAPTERS.instagram.validate(draft('instagram')), []);
    const webp = draft('instagram', { media: [{ url: 'https://x/a.webp' }] });
    assert.match(ADAPTERS.instagram.validate(webp).join(), /formato no admitido/);
    assert.match(ADAPTERS.facebook.validate(draft('facebook', { media: [] })).join(), /No hay fotos/);
    assert.match(ADAPTERS.youtube.validate(draft('youtube', { video: {} })).join(), /Falta el vídeo/);
    assert.match(ADAPTERS.linkedin.validate(draft('linkedin', { hashtags: ['a', 'b', 'c', 'd', 'e', 'f'] })).join(), /hashtags/);
});

test('buildPayload() never contains tokens', () => {
    for (const [network, adapter] of Object.entries(ADAPTERS)) {
        const p = JSON.stringify(adapter.buildPayload(draft(network), { account_id: 'X', access_token: 'SECRET-TOKEN', refresh_token: 'SECRET-REFRESH' }, config));
        assert.ok(!p.includes('SECRET'), network);
    }
});

test('LinkedIn: initializeUpload + PUT per image, then multiImage post', async () => {
    let n = 0;
    const fetch = mockFetch([
        ['POST https://api.linkedin.com/rest/images?action=initializeUpload', () => {
            n += 1;
            return { body: { value: { uploadUrl: `https://upload.linkedin.test/${n}`, image: `urn:li:image:IMG${n}` } } };
        }],
        ['GET https://storage.test/', jpeg],
        ['PUT https://upload.linkedin.test/', () => ({ status: 201 })],
        ['POST https://api.linkedin.com/rest/posts', () => ({ status: 201, headers: { 'x-restli-id': 'urn:li:share:123' } })],
    ]);
    const res = await ADAPTERS.linkedin.publish(draft('linkedin'), { account_id: 'urn:li:organization:999', access_token: 'tok' }, ctx(fetch));
    assert.equal(res.externalId, 'urn:li:share:123');
    assert.equal(res.externalUrl, 'https://www.linkedin.com/feed/update/urn:li:share:123/');
    const post = fetch.calls.find(c => c.url.endsWith('/rest/posts'));
    assert.equal(post.init.headers['Linkedin-Version'], '202610');
    assert.equal(post.init.headers['X-Restli-Protocol-Version'], '2.0.0');
    const body = JSON.parse(post.init.body);
    assert.equal(body.author, 'urn:li:organization:999');
    assert.deepEqual(body.content.multiImage.images.map(i => i.id), ['urn:li:image:IMG1', 'urn:li:image:IMG2']);
    assert.match(body.commentary, /Texto \\\(con paréntesis\\\)/);
    assert.match(body.commentary, /\{hashtag\|\\#\|Villa\}/);
});

test('Facebook: unpublished photos then one /feed post with attached_media', async () => {
    let n = 0;
    const fetch = mockFetch([
        ['POST https://graph.facebook.com/v26.0/PAGE1/photos', () => ({ body: { id: `PH${++n}` } })],
        ['POST https://graph.facebook.com/v26.0/PAGE1/feed', () => ({ body: { id: 'PAGE1_POST9' } })],
    ]);
    const res = await ADAPTERS.facebook.publish(draft('facebook'), { account_id: 'PAGE1', access_token: 'ptok' }, ctx(fetch));
    assert.equal(res.externalId, 'PAGE1_POST9');
    const photo = new URLSearchParams(fetch.calls[0].init.body.toString());
    assert.equal(photo.get('published'), 'false');
    assert.equal(photo.get('url'), images[0].url);
    const feed = new URLSearchParams(fetch.calls[2].init.body.toString());
    assert.equal(feed.get('attached_media[1]'), '{"media_fbid":"PH2"}');
    assert.match(feed.get('message'), new RegExp(LINK.replace(/[.?]/g, '\\$&')));
});

test('Instagram: carousel items, carousel container, wait FINISHED, publish', async () => {
    let n = 0;
    let polls = 0;
    const fetch = mockFetch([
        ['POST https://graph.facebook.com/v26.0/IG1/media_publish', () => ({ body: { id: 'MEDIA77' } })],
        ['POST https://graph.facebook.com/v26.0/IG1/media', () => ({ body: { id: `C${++n}` } })],
        [/^GET https:\/\/graph\.facebook\.com\/v26\.0\/C3\?fields=status_code/, () => ({ body: { status_code: ++polls < 2 ? 'IN_PROGRESS' : 'FINISHED' } })],
        [/^GET https:\/\/graph\.facebook\.com\/v26\.0\/MEDIA77\?fields=permalink/, () => ({ body: { permalink: 'https://www.instagram.com/p/abc/' } })],
    ]);
    const res = await ADAPTERS.instagram.publish(draft('instagram'), { account_id: 'IG1', access_token: 'ptok' }, ctx(fetch));
    assert.equal(res.externalId, 'MEDIA77');
    assert.equal(res.externalUrl, 'https://www.instagram.com/p/abc/');
    const carousel = new URLSearchParams(fetch.calls[2].init.body.toString());
    assert.equal(carousel.get('media_type'), 'CAROUSEL');
    assert.equal(carousel.get('children'), 'C1,C2');
    assert.ok(!carousel.get('caption').includes('https://'), 'no link in the Instagram caption');
    assert.equal(polls, 2);
});

test('Instagram: a container in ERROR fails without publishing', async () => {
    const fetch = mockFetch([
        ['POST https://graph.facebook.com/v26.0/IG1/media', () => ({ body: { id: 'C1' } })],
        [/status_code/, () => ({ body: { status_code: 'ERROR' } })],
    ]);
    await assert.rejects(ADAPTERS.instagram.publish(draft('instagram', { media: [images[0]] }), { account_id: 'IG1', access_token: 't' }, ctx(fetch)), /ERROR/);
    assert.ok(!fetch.calls.some(c => c.url.includes('media_publish')));
});

const youtubeRoutes = (opts = {}) => {
    let uploads = 0;
    return mockFetch([
        ['POST https://oauth2.googleapis.com/token', () => ({ body: { access_token: 'ya29.access' } })],
        ['GET https://storage.test/', () => ({ body: new Uint8Array(1024), headers: { 'content-type': 'video/mp4' } })],
        ['POST https://www.googleapis.com/upload/youtube/v3/videos', () => ({ headers: { location: `https://upload.youtube.test/s${uploads + 1}` } })],
        ['PUT https://upload.youtube.test/', () => {
            uploads += 1;
            if (opts.failShort && uploads === 2) return { status: 500, body: { error: { message: 'backend error' } } };
            return { status: 201, body: { id: `VID${uploads}`, status: { privacyStatus: opts.privacy || 'public' } } };
        }],
    ]);
};

test('YouTube: refresh token, resumable upload of video and Short', async () => {
    const fetch = youtubeRoutes();
    const res = await ADAPTERS.youtube.publish(draft('youtube'), { account_id: 'mine', refresh_token: 'r' }, ctx(fetch));
    assert.equal(res.externalId, 'VID1');
    assert.equal(res.extra.short_id, 'VID2');
    assert.equal(res.extra.warning, undefined);
    const session = fetch.calls.find(c => c.url.startsWith('https://www.googleapis.com/upload'));
    assert.equal(session.init.headers['X-Upload-Content-Type'], 'video/mp4');
    assert.equal(session.init.headers['X-Upload-Content-Length'], '1024');
    const meta = JSON.parse(session.init.body);
    assert.equal(meta.status.selfDeclaredMadeForKids, false);
    assert.ok(meta.snippet.description.startsWith(LINK));
});

test('YouTube: forced-private uploads are reported, not hidden', async () => {
    const res = await ADAPTERS.youtube.publish(draft('youtube'), { refresh_token: 'r' }, ctx(youtubeRoutes({ privacy: 'private' })));
    assert.match(res.extra.warning, /private/);
});

test('YouTube: if the Short fails, the video id travels on the error (no duplicate on retry)', async () => {
    const err = await ADAPTERS.youtube.publish(draft('youtube'), { refresh_token: 'r' }, ctx(youtubeRoutes({ failShort: true }))).catch(e => e);
    assert.equal(err.partial.externalId, 'VID1');
    // Retry with the partial state: only the Short is uploaded.
    const fetch = youtubeRoutes();
    const res = await ADAPTERS.youtube.publish(draft('youtube', { external_id: 'VID1', external_extra: err.partial.extra }), { refresh_token: 'r' }, ctx(fetch));
    assert.equal(res.externalId, 'VID1');
    assert.equal(fetch.calls.filter(c => c.method === 'PUT').length, 1);
});

test('HTTP: 5xx is retried, 4xx is not', async () => {
    let calls = 0;
    const flaky = mockFetch([
        ['POST https://graph.facebook.com/v26.0/PAGE1/photos', () => (++calls < 3 ? { status: 503 } : { body: { id: 'PH' } })],
        ['POST https://graph.facebook.com/v26.0/PAGE1/feed', () => ({ body: { id: 'P' } })],
    ]);
    await ADAPTERS.facebook.publish(draft('facebook', { media: [images[0]] }), { account_id: 'PAGE1', access_token: 't' }, ctx(flaky));
    assert.equal(calls, 3);

    let denied = 0;
    const forbidden = mockFetch([
        ['POST https://graph.facebook.com/v26.0/PAGE1/photos', () => { denied += 1; return { status: 403, body: { error: { message: '(#200) Permissions error' } } }; }],
    ]);
    await assert.rejects(
        ADAPTERS.facebook.publish(draft('facebook'), { account_id: 'PAGE1', access_token: 't' }, ctx(forbidden)),
        (e) => e.status === 403 && /Permissions error/.test(e.message),
    );
    assert.equal(denied, 1);
});
