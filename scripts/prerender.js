/* eslint-env node */
/**
 * Post-build pre-rendering script.
 * Generates static HTML for key routes so Google can index content
 * without executing JavaScript.
 *
 * Usage: node scripts/prerender.js
 * Runs automatically after `vite build` via npm run build.
 */
import { launch } from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = resolve(__dirname, '..', 'dist');
const PORT = 4173;

// Routes to pre-render (static pages only - dynamic ones like /property/:id are handled by schema in index.html)
const ROUTES = [
    '/',
    '/venta',
    '/about',
    '/contact',
    '/blog',
    '/privacy',
    '/terms',
];

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
    console.log('Starting pre-render...');

    const server = createStaticServer();
    await new Promise(r => server.listen(PORT, r));
    console.log(`Static server running on port ${PORT}`);

    const browser = await launch({ headless: true, args: ['--no-sandbox'] });

    for (const route of ROUTES) {
        try {
            const page = await browser.newPage();
            const url = `http://localhost:${PORT}${route}`;
            console.log(`Pre-rendering: ${route}`);

            await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

            // Wait a bit for React Helmet to update the head
            await new Promise(r => setTimeout(r, 2000));

            const html = await page.content();

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

            await page.close();
        } catch (err) {
            console.error(`  Error pre-rendering ${route}:`, err.message);
        }
    }

    await browser.close();
    server.close();
    console.log('Pre-render complete!');
}

prerender().catch(err => {
    console.error('Pre-render failed:', err);
    process.exit(1);
});
