import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encrypt, decrypt, signState, verifyState } from '../../server/social/crypto.js';
import { normalizeHashtags, escapeLittle, composeText, composeLinkedInCommentary, clampDraft, utf8Bytes } from '../../server/social/text.js';
import { LIMITS } from '../../server/social/limits.js';
import { getConfig } from '../../server/social/config.js';
import { KEY } from './helpers.js';

test('dry-run is on unless SOCIAL_DRY_RUN is exactly "false"', () => {
    assert.equal(getConfig({}).dryRun, true);
    assert.equal(getConfig({ SOCIAL_DRY_RUN: 'False' }).dryRun, true);
    assert.equal(getConfig({ SOCIAL_DRY_RUN: '0' }).dryRun, true);
    assert.equal(getConfig({ SOCIAL_DRY_RUN: 'false' }).dryRun, false);
});

test('tokens round-trip through AES-256-GCM and tampering is detected', () => {
    const enc = encrypt('EAAB-secret-token', KEY);
    assert.notEqual(enc, encrypt('EAAB-secret-token', KEY), 'fresh IV per value');
    assert.equal(decrypt(enc, KEY), 'EAAB-secret-token');
    const raw = Buffer.from(enc, 'base64');
    raw[raw.length - 1] ^= 1;
    assert.throws(() => decrypt(raw.toString('base64'), KEY));
    assert.throws(() => encrypt('x', 'short'), /32 bytes/);
});

test('OAuth state is signed and expires', () => {
    const now = Date.now();
    const s = signState({ p: 'meta', e: 'a@b.c' }, 'secret', 600, now);
    assert.equal(verifyState(s, 'secret', now).p, 'meta');
    assert.equal(verifyState(s, 'other', now), null);
    assert.equal(verifyState(s, 'secret', now + 601_000), null);
    assert.equal(verifyState(`${s}x`, 'secret', now), null);
});

test('hashtags are normalised and deduplicated', () => {
    assert.deepEqual(normalizeHashtags(['#Villa', 'villa', 'lujo marbella', '#Málaga!', '', null]), ['Villa', 'lujoMarbella', 'Málaga']);
});

test('LinkedIn little text escapes every reserved character and templates hashtags', () => {
    assert.equal(escapeLittle('Villa (Ronda) #1 @x [a] {b} <c> *d* _e_ ~f~ |g| \\'), 'Villa \\(Ronda\\) \\#1 \\@x \\[a\\] \\{b\\} \\<c\\> \\*d\\* \\_e\\_ \\~f\\~ \\|g\\| \\\\');
    const c = composeLinkedInCommentary({ body: 'Hola (test)', link: 'https://x.test/a_b', hashtags: ['Villa'] });
    assert.equal(c, 'Hola \\(test\\)\n\nhttps://x.test/a\\_b\n\n{hashtag|\\#|Villa}');
});

test('composeText: Instagram has no link, YouTube puts it first', () => {
    const d = { body: 'Texto', link: 'https://l', hashtags: ['A', 'B'] };
    assert.equal(composeText('instagram', d), 'Texto\n\n#A #B');
    assert.equal(composeText('facebook', d), 'Texto\n\nhttps://l\n\n#A #B');
    assert.equal(composeText('youtube', d), 'https://l\n\nTexto\n\n#A #B');
});

test('clampDraft keeps every network within its hard limits', () => {
    const long = 'palabra '.repeat(2000);
    const tags = Array.from({ length: 40 }, (_, i) => `tag${i}`);
    for (const network of ['linkedin', 'facebook', 'instagram']) {
        const d = clampDraft(network, { body: long, hashtags: tags, link: 'https://www.azimutproperty.com/property/x-1' });
        assert.ok(composeText(network, d).length <= LIMITS[network].maxChars, network);
        assert.ok(d.hashtags.length <= LIMITS[network].maxHashtags, network);
    }
    const yt = clampDraft('youtube', { title: `<b>${'T'.repeat(150)}</b>`, body: `ñ${long}<>`, hashtags: tags, link: 'https://l' });
    assert.ok(yt.title.length <= 100);
    assert.ok(!/[<>]/.test(yt.title + yt.body));
    assert.ok(utf8Bytes(composeText('youtube', yt)) <= LIMITS.youtube.maxDescriptionBytes);
});
