import React from 'react';
import { Helmet } from 'react-helmet-async';

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
