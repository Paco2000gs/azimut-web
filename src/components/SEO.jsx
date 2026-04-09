import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website', noindex = false, keywords = '', lang = 'es' }) => {
    const siteTitle = 'Azimut Property | Luxury Real Estate & Villas in Marbella and Andalusia';
    const defaultDescription = 'Exclusive real estate in Marbella, Estepona and Benahavís. Off-market villas, branded residences and expert consultancy for international buyers.';
    const defaultImage = 'https://www.azimutproperty.com/azimut-logo-gold.png';
    const siteUrl = 'https://www.azimutproperty.com';

    const fullTitle = title ? `${title} | Azimut Property` : siteTitle;
    const fullDescription = description || defaultDescription;
    const fullImage = image || defaultImage;
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

    // Build the English URL equivalent for hreflang
    const enUrl = url ? `${siteUrl}/en${url === '/' ? '' : url}` : `${siteUrl}/en`;

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

            {/* Hreflang tags for multilingual SEO */}
            <link rel="alternate" hreflang="es" href={fullUrl} />
            <link rel="alternate" hreflang="en" href={enUrl} />
            <link rel="alternate" hreflang="x-default" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
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
