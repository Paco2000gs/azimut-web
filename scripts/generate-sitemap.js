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

// A city page carrying one or two listings is ~90 words of its own text wrapped in
// the same template as every other city. Google crawled /venta/constantina and
// /venta/sotogrande on 15 Aug 2026 and left both as "Crawled - currently not
// indexed", while 38 URLs that DO earn their place (every blog post, 12 property
// pages) sat undiscovered because the crawl budget went here first. Below this
// threshold a city still renders and stays internally linked — it just stops being
// advertised in the sitemap.
const MIN_CITY_LISTINGS = 3;

async function generateSitemap() {
    console.log('Generating sitemap...');
    const baseUrl = 'https://www.azimutproperty.com';

    // 1. Static & Silo Routes
    // Province landing pages stay unconditionally: they are indexed, they carry the
    // Spanish keywords that bring what little traffic exists ("fincas sevilla",
    // "cortijos en venta en sevilla"), and they aggregate every city beneath them.
    const staticRoutes = [
        '/',
        '/venta',
        // Rural Andalucía — province landing pages
        '/venta/cadiz',
        '/venta/huelva',
        '/venta/sevilla',
        '/venta/malaga',
        '/about',
        '/contact',
        '/blog',
        '/buying-guide',
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

    // Provinces are emitted above as static routes, so the threshold below must
    // never apply to them and they must never be emitted a second time.
    const provinceSlugs = new Set(
        staticRoutes
            .filter(r => r.startsWith('/venta/'))
            .map(r => r.replace('/venta/', ''))
    );
    const listingsPerCity = {}; // citySlug -> number of listings

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

                if (property.city) {
                    listingsPerCity[citySlug] = (listingsPerCity[citySlug] || 0) + 1;
                }

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

                // Never advertise /venta/{city}/{type} for a city whose own page is
                // too thin to be advertised — the child cannot be worth more than
                // the parent it filters.
                if (!provinceSlugs.has(parentSlug) && (listingsPerCity[parentSlug] || 0) < MIN_CITY_LISTINGS) return;

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

        // 3. Silo Routes (cities from properties, thin ones excluded)
        {
            const included = [];
            const skipped = [];
            Object.entries(listingsPerCity).forEach(([citySlug, count]) => {
                // Provinces are already emitted as static routes — never twice.
                if (provinceSlugs.has(citySlug)) return;

                if (count < MIN_CITY_LISTINGS) {
                    skipped.push(`${citySlug} (${count})`);
                    return;
                }

                included.push(citySlug);
                sitemap += `
  <url>
    <loc>${baseUrl}/venta/${citySlug}</loc>
    <lastmod>${today}</lastmod>
  </url>`;
            });

            console.log(`Added ${included.length} location silos to sitemap (>= ${MIN_CITY_LISTINGS} listings): ${included.join(', ') || 'none'}`);
            if (skipped.length) {
                console.log(`Skipped ${skipped.length} thin city pages: ${skipped.join(', ')}`);
            }
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
