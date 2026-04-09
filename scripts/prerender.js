/* eslint-env node */
/**
 * Post-build pre-rendering script.
 * Generates static HTML for ALL public routes so Google and AI crawlers
 * can index content without executing JavaScript.
 *
 * Queries Supabase for dynamic routes (properties, blog posts, location cities).
 *
 * Usage: node scripts/prerender.js
 * Runs automatically after `vite build` via npm run build.
 */
import { launch } from 'puppeteer';
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
    '/venta/marbella',
    '/venta/benahavis',
    '/venta/estepona',
    '/venta/mijas',
    '/venta/fuengirola',
    '/venta/benalmadena',
    '/venta/nerja',
];

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

    // Property detail pages
    try {
        const { data: properties, error } = await supabase
            .from('properties')
            .select('id, type, city');

        if (error) throw error;

        const normalize = (str) =>
            str.toLowerCase().normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

        properties.forEach(prop => {
            const typeSlug = normalize(prop.type || 'property');
            const citySlug = normalize(prop.city || 'location');
            routes.push(`/property/${typeSlug}-${citySlug}-${prop.id}`);
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

    // Blog post pages
    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select('id');

        if (error) throw error;

        posts.forEach(post => {
            routes.push(`/blog/${post.id}`);
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

    let browser;
    try {
        browser = await launch({ headless: true, args: ['--no-sandbox'] });
    } catch (err) {
        console.error('Could not launch Puppeteer:', err.message);
        console.log('Pre-render skipped (no browser available)');
        server.close();
        return;
    }

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
            // This ensures each prerendered page has its own canonical URL
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
}

prerender().catch(err => {
    console.error('Pre-render failed:', err);
    process.exit(1);
});
