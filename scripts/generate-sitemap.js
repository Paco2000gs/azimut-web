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

    // 1. Static Routes
    const staticRoutes = [
        '/',
        '/catalog',
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
                .select('id, created_at');

            if (error) throw error;

            console.log(`Found ${properties.length} properties.`);

            properties.forEach(property => {
                sitemap += `
  <url>
    <loc>${baseUrl}/property/${property.id}</loc>
    <lastmod>${new Date(property.created_at).toISOString().split('T')[0]}</lastmod> // Simple YYYY-MM-DD
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
            });
        } catch (err) {
            console.error('Error fetching properties for sitemap:', err);
        }

        // 3. Dynamic Routes (Blog Posts)
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
