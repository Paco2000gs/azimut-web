/* eslint-env node */
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase Env Vars. Sitemap generation might be incomplete or fail if dependent on DB.');
    // We don't exit hard because if this runs in an env without vars but doesn't need them critically (e.g. testing), we don't want to break build. 
    // BUT for sitemap we need DB. So we should log and maybe skip dynamic parts or exit.
    // Allow continuing but log error
}

const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

async function generateSitemap() {
    console.log('Generating sitemap...');
    const baseUrl = 'https://www.azimutproperty.com';

    // 1. Static & Silo Routes
    const staticRoutes = [
        '/',
        '/venta',
        '/venta/marbella',
        '/venta/benahavis',
        '/venta/estepona',
        '/about',
        '/contact',
        '/blog',
        '/privacy-policy'
    ];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static routes
    staticRoutes.forEach(route => {
        sitemap += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // 2. Dynamic Routes (Properties)
    if (supabase) {
        try {
            const { data: properties, error } = await supabase
                .from('properties')
                .select('id, type, city, created_at');

            if (error) throw error;

            console.log(`Found ${properties.length} properties.`);

            properties.forEach(property => {
                // Generate slug: type-city-id
                const generateSlug = (prop) => {
                    const normalize = (str) => {
                        return str
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '') // Remove accents
                            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
                            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
                    };

                    const typeSlug = normalize(prop.type || 'property');
                    const citySlug = normalize(prop.city || 'location');

                    return `${typeSlug}-${citySlug}-${prop.id}`;
                };

                const slug = generateSlug(property);

                sitemap += `
  <url>
    <loc>${baseUrl}/property/${slug}</loc>
    <lastmod>${new Date(property.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
            });
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
                const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const citySlug = normalize(city);

                sitemap += `
  <url>
    <loc>${baseUrl}/venta/${citySlug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
            });
            console.log(`Added ${uniqueCities.length} location silos to sitemap.`);
        } catch (err) {
            console.error('Error fetching locations for sitemap silos:', err);
        }

        // 4. Dynamic Routes (Blog Posts)
        try {
            const { data: posts, error } = await supabase
                .from('posts')
                .select('id, published_at');

            if (error) throw error;

            console.log(`Found ${posts.length} blog posts.`);

            posts.forEach(post => {
                sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.id}</loc>
    <lastmod>${new Date(post.published_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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
