/* eslint-env node */
// Every URL in sitemap.xml must be a final 200 page. If vercel.json redirects it,
// Google gets a 308 for a URL we told it to index — and when the redirect points
// at a live listing (fichas 29-33, Oct 2026), the listing itself becomes
// unreachable. Run `npm run generate-sitemap` first to test the current data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sitemap = readFileSync(resolve(root, 'public', 'sitemap.xml'), 'utf8');
const { redirects } = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));

const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, loc]) => new URL(loc.trim()).pathname);

// Vercel path-to-regexp subset used in vercel.json: `:name(regex)`, `:name*`, `:name`.
const sourceToRegExp = (source) => {
    const pattern = source
        .replace(/[.+?^${}|[\]\\]/g, '\\$&')
        .replace(/:\w+\(([^)]*)\)/g, '($1)')
        .replace(/\/:\w+\*/g, '(?:/.*)?')
        .replace(/:\w+/g, '[^/]+');
    return new RegExp(`^${pattern}$`);
};

// Host-conditioned rules (apex → www) never match the canonical www URLs.
const pathRedirects = redirects
    .filter((r) => !r.has)
    .map((r) => ({ ...r, re: sourceToRegExp(decodeURI(r.source)) }));

test('sitemap.xml has URLs', () => {
    assert.ok(sitemapPaths.length > 0, 'public/sitemap.xml contains no <loc> entries');
});

test('no sitemap URL is redirected by vercel.json', () => {
    const redirected = sitemapPaths.flatMap((path) =>
        pathRedirects
            .filter((r) => r.re.test(decodeURI(path)))
            .map((r) => `${path} -> ${r.destination}`)
    );
    assert.deepEqual(redirected, [], `Sitemap URLs that redirect:\n${redirected.join('\n')}`);
});
