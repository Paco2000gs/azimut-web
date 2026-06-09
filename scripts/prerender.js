/* eslint-env node */
/**
 * Post-build pre-rendering script.
 * Generates static HTML for ALL public routes so Google and AI crawlers
 * can index content without executing JavaScript.
 *
 * Works in TWO environments:
 *   - Local: uses full Puppeteer (puppeteer package with bundled Chrome)
 *   - Vercel/CI: uses puppeteer-core + @sparticuz/chromium (serverless Chrome)
 *
 * Queries Supabase for dynamic routes (properties, blog posts, location cities).
 *
 * Usage: node scripts/prerender.js
 * Runs automatically after `vite build` via npm run build.
 */
import puppeteerCore from 'puppeteer-core';
import { createClient } from '@supabase/supabase-js';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, '..', 'dist');
const PORT = 4173;

// Static routes (always pre-rendered)
const STATIC_ROUTES = [
    '/',
    '/venta',
    '/about',
    '/contact',
    '/blog',
    '/privacy',
    '/terms',
];

// Core location city routes (always pre-rendered even without Supabase)
const CORE_LOCATION_ROUTES = [
    // Costa del Sol (Málaga)
    '/venta/marbella',
    '/venta/benahavis',
    '/venta/estepona',
    '/venta/mijas',
    '/venta/fuengirola',
    '/venta/benalmadena',
    '/venta/nerja',
    // Rural Andalucía — province landing pages
    '/venta/cadiz',
    '/venta/huelva',
    '/venta/sevilla',
];

const normalize = (str) =>
    str.toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

/**
 * Launch browser — works on both local (full Puppeteer) and Vercel/CI (@sparticuz/chromium)
 */
async function launchBrowser() {
    // Strategy 1: Try @sparticuz/chromium (works on Vercel, Lambda, CI)
    try {
        const chromium = await import('@sparticuz/chromium');
        const chromiumMod = chromium.default || chromium;

        // On Vercel, chromium.executablePath() returns the path to the serverless Chrome binary
        const executablePath = await chromiumMod.executablePath();

        if (executablePath) {
            console.log('Using @sparticuz/chromium (serverless environment)');
            const browser = await puppeteerCore.launch({
                args: chromiumMod.args,
                defaultViewport: chromiumMod.defaultViewport,
                executablePath,
                headless: 'shell',
            });
            return browser;
        }
    } catch {
        // @sparticuz/chromium not available or no binary — fall through
    }

    // Strategy 2: Try full Puppeteer (local dev — has its own bundled Chrome)
    try {
        const puppeteerFull = await import('puppeteer');
        const puppeteer = puppeteerFull.default || puppeteerFull;
        console.log('Using full Puppeteer (local environment)');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        return browser;
    } catch {
        // Full puppeteer not available — fall through
    }

    // Strategy 3: Try system Chrome with puppeteer-core
    const possiblePaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];

    for (const chromePath of possiblePaths) {
        try {
            if (existsSync(chromePath)) {
                console.log(`Using system Chrome: ${chromePath}`);
                const browser = await puppeteerCore.launch({
                    executablePath: chromePath,
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                });
                return browser;
            }
        } catch {
            continue;
        }
    }

    throw new Error('No Chrome/Chromium binary found. Install puppeteer or @sparticuz/chromium.');
}

/**
 * Fetch dynamic routes from Supabase (properties + blog posts + extra cities)
 */
async function getDynamicRoutes() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ No Supabase credentials — skipping dynamic routes');
        return [];
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const routes = [];

    // Custom SEO slugs map: property ID -> custom slug under /properties/
    const CUSTOM_SLUGS = {
        19: 'equestrian-estate-vineyard-sotogrande-cadiz-48-hectares',
        22: 'villa-sotogrande-alto-golf-lake-views-spa',
    };

    // Property detail pages
    try {
        const { data: properties, error } = await supabase
            .from('properties')
            .select('id, type, city');

        if (error) throw error;

        properties.forEach(prop => {
            // Use custom slug if available, otherwise default format
            if (CUSTOM_SLUGS[prop.id]) {
                routes.push(`/properties/${CUSTOM_SLUGS[prop.id]}`);
            } else {
                const typeSlug = normalize(prop.type || 'property');
                const citySlug = normalize(prop.city || 'location');
                routes.push(`/property/${typeSlug}-${citySlug}-${prop.id}`);
            }
        });

        // Extra city pages from properties not in core list
        const coreSlugs = new Set(CORE_LOCATION_ROUTES.map(r => r.replace('/venta/', '')));
        const uniqueCities = [...new Set(properties.map(p => p.city).filter(Boolean))];
        uniqueCities.forEach(city => {
            const slug = normalize(city);
            if (!coreSlugs.has(slug)) {
                routes.push(`/venta/${slug}`);
            }
        });

        console.log(`  Found ${properties.length} properties`);
    } catch (err) {
        console.error('  Error fetching properties:', err.message);
    }

    // Blog post pages (with SEO-friendly slugs)
    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select('id, title');

        if (error) throw error;

        posts.forEach(post => {
            const titleSlug = normalize(post.title || 'post');
            routes.push(`/blog/${titleSlug}-${post.id}`);
        });

        console.log(`  Found ${posts.length} blog posts`);
    } catch (err) {
        console.error('  Error fetching blog posts:', err.message);
    }

    return routes;
}

// Simple static file server for the dist folder
function createStaticServer() {
    const mime = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2',
        '.webp': 'image/webp',
        '.xml': 'application/xml',
        '.txt': 'text/plain',
    };

    return createServer((req, res) => {
        let filePath = resolve(DIST_DIR, req.url === '/' ? 'index.html' : req.url.slice(1));

        // SPA fallback: if file doesn't exist, serve index.html
        if (!existsSync(filePath)) {
            filePath = resolve(DIST_DIR, 'index.html');
        }

        try {
            const content = readFileSync(filePath);
            const ext = filePath.match(/\.\w+$/)?.[0] || '.html';
            res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
            res.end(content);
        } catch {
            res.writeHead(404);
            res.end('Not found');
        }
    });
}

async function prerender() {
    console.log('Starting pre-render...\n');

    // Gather all routes
    console.log('Fetching dynamic routes from Supabase...');
    const dynamicRoutes = await getDynamicRoutes();
    const allRoutes = [...STATIC_ROUTES, ...CORE_LOCATION_ROUTES, ...dynamicRoutes];

    // Deduplicate
    const uniqueRoutes = [...new Set(allRoutes)];
    console.log(`\nTotal routes to pre-render: ${uniqueRoutes.length}\n`);

    const server = createStaticServer();
    await new Promise(r => server.listen(PORT, r));
    console.log(`Static server running on port ${PORT}\n`);

    // Launch browser (works on local AND Vercel/CI)
    const browser = await launchBrowser();

    let success = 0;
    let failed = 0;

    for (const route of uniqueRoutes) {
        try {
            const page = await browser.newPage();
            const url = `http://localhost:${PORT}${route}`;
            console.log(`Pre-rendering: ${route}`);

            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

            // Wait for React Helmet to update the head
            await new Promise(r => setTimeout(r, 2000));

            let html = await page.content();

            // Verify that Helmet set a per-page canonical (not the default homepage one)
            const hasHelmetCanonical = html.includes('data-rh="true"');
            if (!hasHelmetCanonical && route !== '/') {
                console.warn(`  ⚠️ Helmet may not have set canonical for ${route}`);
            }

            // Determine output path
            const outputDir = route === '/'
                ? DIST_DIR
                : resolve(DIST_DIR, route.slice(1));

            if (!existsSync(outputDir)) {
                mkdirSync(outputDir, { recursive: true });
            }

            const outputFile = resolve(outputDir, 'index.html');
            writeFileSync(outputFile, html);
            console.log(`  -> Saved: ${outputFile}`);
            success++;

            await page.close();
        } catch (err) {
            console.error(`  Error pre-rendering ${route}:`, err.message);
            failed++;
        }
    }

    await browser.close();
    server.close();

    console.log(`\nPre-render complete! ${success} succeeded, ${failed} failed out of ${uniqueRoutes.length} routes.`);

    // FAIL the build if too many routes failed (ensures Vercel doesn't deploy broken HTML)
    if (failed > 0 && success === 0) {
        console.error('\n❌ All routes failed to pre-render. Aborting build.');
        process.exit(1);
    }
    if (failed > uniqueRoutes.length * 0.2) {
        console.error(`\n❌ Too many failures (${failed}/${uniqueRoutes.length}). Aborting build.`);
        process.exit(1);
    }
}

prerender().catch(err => {
    console.error('Pre-render failed:', err);
    process.exit(1);
});
