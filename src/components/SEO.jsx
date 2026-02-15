import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website', noindex = false }) => {
    const siteTitle = 'Azimut Property | Luxury Real Estate & Villas in Marbella and Andalusia';
    const defaultDescription = 'Specialists in exclusive real estate assets in Marbella, Estepona, and Benahavís. Access to off-market villas, branded residences, and expert consultancy for HNWI investors in Andalusia.';
    const defaultImage = 'https://www.azimutproperty.com/azimut-logo-gold.png';
    const siteUrl = 'https://www.azimutproperty.com';

    const fullTitle = title ? `${title} | Azimut Property` : siteTitle;
    const fullDescription = description || defaultDescription;
    const fullImage = image || defaultImage;
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <link rel="canonical" href={fullUrl} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="Azimut Property" />
            <meta property="og:locale" content="es_ES" />

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
