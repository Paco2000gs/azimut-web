import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Sets a meta tag in place, creating it only if the prerendered head lacks it.
 * Editing the existing node matters: Helmet marks its own tags with data-rh and
 * appending duplicates would leave two competing descriptions in the head.
 */
const setMeta = (attr, key, value) => {
    if (!value) return;
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', value);
};

const setLink = (selector, rel, href, hreflang) => {
    let el = document.head.querySelector(selector);
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        if (hreflang) el.setAttribute('hreflang', hreflang);
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
};

const SEO = ({ title, description, image, imageDimensions, url, type = 'website', noindex = false, keywords = '', lang = 'es' }) => {
    const siteTitle = 'Azimut Property | Luxury Real Estate & Villas in Marbella and Andalusia';
    const defaultDescription = 'Exclusive real estate in Marbella, Estepona and Benahavís. Off-market villas, branded residences and expert consultancy for international buyers.';
    // A real 1200x630 card, not the logo: social platforms lay the preview out
    // at that ratio, and a 442x460 transparent PNG rendered as a smudge.
    const defaultImage = 'https://www.azimutproperty.com/media/social-card.jpg';
    const siteUrl = 'https://www.azimutproperty.com';

    const fullTitle = title 
        ? (title.includes('Azimut Property') ? title : `${title} | Azimut Property`) 
        : siteTitle;
    const rawDescription = description || defaultDescription;
    const fullDescription = rawDescription.length > 320
        ? rawDescription.substring(0, rawDescription.lastIndexOf(' ', 320)) + '...'
        : rawDescription;
    const fullImage = image || defaultImage;
    // Only declare a size we actually know. These tags were hardcoded to
    // 1200x630 while the image was 442x460, which is worse than omitting them.
    const dims = image ? imageDimensions : { width: 1200, height: 630 };
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

    const ogLocale = lang === 'en' ? 'en_GB' : 'es_ES';

    // react-helmet-async writes this head correctly during the prerender, but in
    // the browser it only ever applies once. Verified in production on 28 Aug
    // 2026: navigating /venta -> a listing, or /about -> /contact, left the
    // previous page's <title>, canonical and og tags untouched while the body
    // rendered the new route. Indexing is unaffected (crawlers read the
    // prerendered HTML), but GA4 filed every listing view as "Property
    // Catalogue", and a link copied from inside the app carried the wrong title.
    //
    // Rather than fight the library's lifecycle, the same values are written
    // straight to the live head on every route change. Helmet still owns the
    // prerender; this only keeps the client honest afterwards.
    useEffect(() => {
        if (typeof document === 'undefined') return;

        document.title = fullTitle;
        document.documentElement.lang = lang;

        setMeta('name', 'description', fullDescription);
        setMeta('name', 'keywords', keywords);

        // The site-wide robots directive lives in index.html. Only a noindex
        // page may overwrite it, and leaving that page must put it back.
        const robots = document.head.querySelector('meta[name="robots"]');
        if (noindex) {
            setMeta('name', 'robots', 'noindex, nofollow');
        } else if (robots && /noindex/i.test(robots.getAttribute('content') || '')) {
            robots.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
        }

        setLink('link[rel="canonical"]', 'canonical', fullUrl);
        setLink('link[rel="alternate"][hreflang="x-default"]', 'alternate', fullUrl, 'x-default');
        const selfHreflang = document.head.querySelector(`link[rel="alternate"][hreflang="${lang}"]`)
            || document.head.querySelector('link[rel="alternate"]:not([hreflang="x-default"])');
        if (selfHreflang) {
            selfHreflang.setAttribute('hreflang', lang);
            selfHreflang.setAttribute('href', fullUrl);
        } else {
            setLink(`link[rel="alternate"][hreflang="${lang}"]`, 'alternate', fullUrl, lang);
        }

        setMeta('property', 'og:type', type);
        setMeta('property', 'og:url', fullUrl);
        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', fullDescription);
        setMeta('property', 'og:image', fullImage);
        setMeta('property', 'og:locale', ogLocale);

        setMeta('name', 'twitter:url', fullUrl);
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', fullDescription);
        setMeta('name', 'twitter:image', fullImage);
    }, [fullTitle, fullDescription, fullUrl, fullImage, ogLocale, lang, type, keywords, noindex]);

    return (
        <Helmet>
            {/* HTML lang attribute — critical for search engine language detection */}
            <html lang={lang} />

            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <link rel="canonical" href={fullUrl} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Hreflang self-references this page in whatever language it is
                actually written in. There is still ONE url per page: do NOT point
                hreflang at /en/* — those routes don't exist and Google was
                indexing them as noindex 404s. Re-add when a real /en/ exists. */}
            <link rel="alternate" hreflang={lang} href={fullUrl} />
            <link rel="alternate" hreflang="x-default" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />
            {dims && <meta property="og:image:width" content={String(dims.width)} />}
            {dims && <meta property="og:image:height" content={String(dims.height)} />}
            <meta property="og:site_name" content="Azimut Property" />
            <meta property="og:locale" content={ogLocale} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            <meta name="twitter:image" content={fullImage} />
        </Helmet>
    );
};

export default SEO;
