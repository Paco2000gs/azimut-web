import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url }) => {
    const siteTitle = 'AzimutProperty | Exclusive Real Estate in Andalusia';
    const defaultDescription = 'Discover exclusive luxury properties in Marbella, Sotogrande, Cádiz, Sevilla, and Málaga. AzimutProperty offers a curated selection of the finest homes in Andalusia.';
    const defaultImage = '/og-image.jpg'; // We should ensure this exists or use a property image
    const siteUrl = 'https://www.azimutproperty.com'; // Replace with actual domain

    const fullTitle = title ? `${title} | AzimutProperty` : siteTitle;
    const fullDescription = description || defaultDescription;
    const fullImage = image ? image : `${siteUrl}${defaultImage}`;
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={fullDescription} />
            <meta property="twitter:image" content={fullImage} />
        </Helmet>
    );
};

export default SEO;
