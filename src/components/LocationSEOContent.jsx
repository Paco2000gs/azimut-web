import React from 'react';

const LocationSEOContent = ({ city, area }) => {
    // Content database for major locations
    const content = {
        'marbella': {
            title: 'Buying Luxury Real Estate in Marbella',
            description: `Marbella remains the undisputed crown jewel of the Mediterranean luxury property market. Known for its microclimate, world-class infrastructure, and exclusive lifestyle, it attracts HNWI from across the globe. 
            
            Whether you are looking for a frontline beach villa in the Golden Mile or a modern mansion in Sierra Blanca, Marbella offers a variety of premium options. Our expertise in the local market ensures you access to the most prestigious off-market listings and investment opportunities.`,
            faqs: [
                { q: 'What are the best areas to buy in Marbella?', a: 'The Golden Mile, Sierra Blanca, and Nueva Andalucía are considered the most prestigious and stable for investment.' },
                { q: 'Is Marbella a good investment for 2026?', a: 'Yes, Marbella continues to show strong capital appreciation and high demand for luxury rentals.' }
            ]
        },
        'sierra-blanca': {
            title: 'Luxury Mansions in Sierra Blanca, Marbella',
            description: `Sierra Blanca is often referred to as the "Beverly Hills of Marbella". Nestled at the foot of La Concha mountain, this ultra-exclusive community offers panoramic sea views and high-level security.
            
            Properties in Sierra Blanca are known for their grand scale, neoclassical or contemporary architecture, and massive plots. It is the perfect choice for families seeking a safe, peaceful environment just minutes away from Marbella Center and Puerto Banús.`,
            faqs: [
                { q: 'Why is Sierra Blanca so popular?', a: 'Its combination of security, proximity to the city center, and stunning views make it one of the most desirable addresses in Spain.' }
            ]
        },
        'benahavis': {
            title: 'Exclusive Villas for Sale in Benahavís',
            description: `Benahavís is the wealthiest municipality in Andalusia, home to some of Europe's most exclusive gated communities, including La Zagaleta and El Madroño. 
            
            This "mountain village" offers unparalleled privacy, security, and breathtaking views of the Mediterranean and Gibraltar. It is the preferred choice for those seeking discrecion and nature without compromising on luxury.`,
            faqs: [
                { q: 'Is La Zagaleta the most exclusive area?', a: 'Yes, La Zagaleta is widely regarded as the most private and secure residential estate in Europe.' }
            ]
        },
        'estepona': {
            title: 'Luxury Properties in the New Golden Mile, Estepona',
            description: `Estepona has undergone a significant transformation, now rivaling Marbella in luxury offerings while maintaining its authentic Andalusian charm. The "New Golden Mile" features stunning beachfront developments and modern villas.
            
            With improved infrastructure and a beautiful renovated old town, Estepona is one of the most exciting areas for luxury real estate investment in the Costa del Sol.`
        },
        'cadiz': {
            title: 'Luxury Coastal Living in Cádiz',
            description: `Cádiz province offers some of the most authentic and pristine coastal experiences in Spain. From the surfers' paradise of Tarifa to the aristocratic estates of Jerez and the exclusive Sotogrande.
            
            The Costa de la Luz is becoming a top choice for those seeking a more relaxed pace of life with high-end amenities and stunning natural beauty.`
        },
        'sotogrande': {
            title: 'Prestigious Estates and Marina Living in Sotogrande',
            description: `Sotogrande is a world-renowned luxury residential resort known for its world-class polo, golf (including Valderrama), and its beautiful marina. 
            
            It offers a unique lifestyle characterized by understated luxury, privacy, and a strong sense of community. Ideal for sports enthusiasts and families seeking a high-quality international environment.`
        },
        // Generic Fallback for other locations
        'default': {
            title: `Exclusive Properties for Sale in ${city}`,
            description: `Discover exclusive property opportunities in ${city}. At Azimut Property, we specialize in identifying unique real estate assets that offer both lifestyle excellence and investment potential in this sought-after location.
            
            Our team provides expert local knowledge and access to a curated selection of properties in ${city}, ensuring a seamless acquisition process for our international clientele.`,
            faqs: [
                { q: `Is ${city} a good place to buy property?`, a: `Yes, ${city} offers a high quality of life and remains a stable market with growing interest from both local and international buyers.` },
                { q: 'How can Azimut Property help me?', a: 'We provide end-to-end consultancy, from identifying the best opportunities to managing the legal and administrative aspects of your purchase.' }
            ]
        }
    };

    const currentContent = content[city?.toLowerCase().replace(/\s+/g, '-')] || content['default'];

    if (!city) return null;

    return (
        <div className="location-seo-content container" style={{ marginTop: '4rem', paddingBottom: '4rem', borderTop: '1px solid #e2e8f0', paddingTop: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#1e293b' }}>{currentContent.title}</h2>
            <div style={{ fontSize: '1.125rem', lineHeight: '1.8', color: '#475569', maxWidth: '800px' }}>
                {currentContent.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} style={{ marginBottom: '1.5rem' }}>{paragraph}</p>
                ))}
            </div>

            {currentContent.faqs && (
                <div className="seo-faqs" style={{ marginTop: '3rem' }}>
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Frequently Asked Questions</h3>
                    <div className="faq-grid" style={{ display: 'grid', gap: '1.5rem' }}>
                        {currentContent.faqs.map((faq, idx) => (
                            <div key={idx} className="faq-item" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem' }}>
                                <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{faq.q}</h4>
                                <p style={{ color: '#64748b' }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationSEOContent;
