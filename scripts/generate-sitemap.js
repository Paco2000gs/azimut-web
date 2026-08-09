/* eslint-env node */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { generatePropertyPath } from '../src/utils/slugify.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase Env Vars. Sitemap generation might be incomplete or fail if dependent on DB.');
    // We don't exit hard because if this runs in an env without vars but doesn't need them critically (e.g. testing), we don't want to break build. 
    // BUT for sitemap we need DB. So we should log and maybe skip dynamic parts or exit.
    // Allow continuing but log error
}

const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const normalize = (str) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

async function generateSitemap() {
    console.log('Generating sitemap...');
    const baseUrl = 'https://www.azimutproperty.com';

    // 1. Static & Silo Routes
    const staticRoutes = [
        '/',
        '/venta',
        // Costa del Sol
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
        '/venta/malaga',
        '/about',
        '/contact',
        '/blog',
        '/privacy',
        '/terms'
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static routes (no changefreq/priority — Google ignores both)
    const today = new Date().toISOString().split('T')[0];
    staticRoutes.forEach(route => {
        sitemap += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${today}</lastmod>
  </url>`;
    });

    // 2. Dynamic Routes (Properties)
    if (supabase) {
        try {
            const { data: properties, error } = await supabase
                .from('properties')
                .select('id, type, city, province, created_at');

            if (error) throw error;

            console.log(`Found ${properties.length} properties.`);

            // Track which distinct types each parent (city or province) has, so we
            // can tell a MEANINGFUL filter page apart from a duplicate one.
            const parentTypes = {}; // parentSlug -> Set(typeSlug)
            const addParentType = (parentSlug, typeSlug) => {
                (parentTypes[parentSlug] ||= new Set()).add(typeSlug);
            };

            properties.forEach(property => {
                const typeSlug = normalize(property.type || 'property');
                const citySlug = normalize(property.city || 'location');

                // Use the canonical path (respects custom /properties/ slugs) so
                // sitemap URLs never diverge from each page's canonical tag.
                sitemap += `
  <url>
    <loc>${baseUrl}${generatePropertyPath(property)}</loc>
    <lastmod>${new Date(property.created_at).toISOString().split('T')[0]}</lastmod>
  </url>`;

                if (property.type) {
                    if (property.city) addParentType(citySlug, typeSlug);
                    if (property.province) addParentType(normalize(property.province), typeSlug);
                }
            });

            // Emit a /venta/{parent}/{type} silo URL ONLY when the parent has 2+
            // distinct types. A single-type parent (e.g. Ronda has only villas)
            // produces a filter page whose listing is identical to the parent city
            // page — a duplicate. Those pages still render (with a canonical pointing
            // to the parent, see Catalog.jsx) but must NOT be advertised in the
            // sitemap, otherwise we'd be submitting non-canonical URLs to Google.
            let siloCount = 0;
            Object.entries(parentTypes).forEach(([parentSlug, types]) => {
                if (types.size < 2) return;
                types.forEach(typeSlug => {
                    sitemap += `
  <url>
    <loc>${baseUrl}/venta/${parentSlug}/${typeSlug}</loc>
    <lastmod>${today}</lastmod>
  </url>`;
                    siloCount++;
                });
            });
            console.log(`Added ${siloCount} city+type silo pages to sitemap (multi-type parents only).`);
        } catch (err) {
            console.error('Error fetching properties for sitemap:', err);
        }

        // 3. Silo Routes (Unique cities from properties)
        try {
            const { data: locations, error: locError } = await supabase
                .from('properties')
                .select('city')
                .not('city', 'is', null);

            if (locError) throw locError;

            const uniqueCities = [...new Set(locations.map(l => l.city))].filter(Boolean);
            uniqueCities.forEach(city => {
                const citySlug = normalize(city);

                sitemap += `
  <url>
    <loc>${baseUrl}/venta/${citySlug}</loc>
    <lastmod>${today}</lastmod>
  </url>`;
            });
            console.log(`Added ${uniqueCities.length} location silos to sitemap.`);
        } catch (err) {
            console.error('Error fetching locations for sitemap silos:', err);
        }

        // 4. Dynamic Routes (Blog Posts — SEO-friendly slugs)
        try {
            const { data: posts, error } = await supabase
                .from('posts')
                .select('id, title, published_at');

            if (error) throw error;

            console.log(`Found ${posts.length} blog posts.`);

            posts.forEach(post => {
                const titleSlug = normalize(post.title || 'post');
                const slug = `${titleSlug}-${post.id}`;

                sitemap += `
  <url>
    <loc>${baseUrl}/blog/${slug}</loc>
    <lastmod>${new Date(post.published_at).toISOString().split('T')[0]}</lastmod>
  </url>`;
            });
        } catch (err) {
            console.error('Error fetching blog posts for sitemap:', err);
        }
    } else {
        console.warn('Skipping dynamic content (properties/posts) in sitemap due to missing Supabase client.');
    }

    sitemap += `
</urlset>`;

    // Ensure public dir exists (it should)
    const outputPath = path.resolve('public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);
    console.log(`✅ Sitemap generated at ${outputPath}`);
}

generateSitemap();
