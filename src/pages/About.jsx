import React from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/About.css';
import SEO from '../components/SEO';

const About = () => {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://www.azimutproperty.com/about" }
        ]
    };

    return (
        <div className="page about">
            <SEO
                title="About Us - Redefining Luxury Real Estate in Marbella"
                description="Meet the Azimut Property team. Boutique agency in Marbella and Costa del Sol specializing in luxury villas and off-market properties."
                url="/about"
                lang="en"
                keywords="about Azimut Property, luxury real estate agency Marbella, international buyers Costa del Sol, boutique real estate"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>
            <div className="about-hero">
                <div className="container">
                    <h1>Redefining Luxury Real Estate</h1>
                    <p>More than a brokerage, we are your partners in the Andalusian lifestyle.</p>
                </div>
            </div>

            <div className="container about-content">
                <div className="about-grid">
                    <div className="about-text">
                        <h2>Our Story</h2>
                        <p>Founded in 2024, AzimutProperty was born from a desire to elevate the real estate experience in Southern Spain. We recognized that the luxury market required a level of service, discretion, and expertise that went beyond the transaction.</p>
                        <p>Our name, "Azimut", reflects our mission: to guide our clients towards their perfect horizon. Whether you are looking for a seafront villa on the Cadiz coast or a historic estate in the Sierra Norte de Sevilla, we navigate the market with precision and care.</p>
                    </div>
                    <div className="about-image">
                        <picture>
                            <source
                                type="image/webp"
                                srcSet="/media/about-story-560.webp 560w, /media/about-story-818.webp 818w"
                                sizes="(max-width: 768px) 100vw, 536px"
                            />
                            <img
                                src="/media/about-story-818.jpg"
                                srcSet="/media/about-story-560.jpg 560w, /media/about-story-818.jpg 818w"
                                sizes="(max-width: 768px) 100vw, 536px"
                                alt="Aerial view of an Andalusian estate: terracotta rooftops, pool and terraced garden cut into the hillside"
                                width="818"
                                height="1022"
                                loading="lazy"
                                decoding="async"
                            />
                        </picture>
                    </div>
                </div>

                <div className="about-grid about-grid--reverse">
                    <div className="about-text">
                        <h2>Our Philosophy</h2>
                        <p>We believe that true luxury lies in the details. It's not just about square meters or amenities; it's about the feeling of a home. We take the time to understand your lifestyle, your tastes, and your dreams.</p>
                        <p>Our portfolio is strictly curated. We turn down more listings than we accept, ensuring that every property we represent meets our high standards of quality, design, and location.</p>
                    </div>
                    <div className="about-image">
                        <picture>
                            <source
                                type="image/webp"
                                srcSet="/media/about-philosophy-560.webp 560w, /media/about-philosophy-1047.webp 1047w"
                                sizes="(max-width: 768px) 100vw, 536px"
                            />
                            <img
                                src="/media/about-philosophy-1047.jpg"
                                srcSet="/media/about-philosophy-560.jpg 560w, /media/about-philosophy-1047.jpg 1047w"
                                sizes="(max-width: 768px) 100vw, 536px"
                                alt="The original press machinery under the restored timber ceiling of a historic Andalusian oil mill"
                                width="1047"
                                height="1309"
                                loading="lazy"
                                decoding="async"
                            />
                        </picture>
                    </div>
                </div>
            </div>


            <div className="team-section">
                <div className="container">
                    <h2>Meet The Team</h2>
                    <div className="team-grid">
                        <div className="team-member">
                            <picture>
                                <source
                                    type="image/webp"
                                    srcSet="/media/team-jose-rey-400.webp 400w, /media/team-jose-rey-800.webp 796w"
                                    sizes="(max-width: 768px) 100vw, 360px"
                                />
                                <img
                                    src="/media/team-jose-rey-800.jpg"
                                    srcSet="/media/team-jose-rey-400.jpg 400w, /media/team-jose-rey-800.jpg 796w"
                                    sizes="(max-width: 768px) 100vw, 360px"
                                    alt="Jose Rey"
                                    width="796"
                                    height="1024"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </picture>
                            <h3>Jose Rey</h3>
                            <p>Founding Partner</p>
                        </div>
                        <div className="team-member">
                            <picture>
                                <source
                                    type="image/webp"
                                    srcSet="/media/team-francisco-garrido-400.webp 400w, /media/team-francisco-garrido-800.webp 800w"
                                    sizes="(max-width: 768px) 100vw, 360px"
                                />
                                <img
                                    src="/media/team-francisco-garrido-800.jpg"
                                    srcSet="/media/team-francisco-garrido-400.jpg 400w, /media/team-francisco-garrido-800.jpg 800w"
                                    sizes="(max-width: 768px) 100vw, 360px"
                                    alt="Francisco Garrido"
                                    width="800"
                                    height="907"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </picture>
                            <h3>Francisco Garrido</h3>
                            <p>Founding Partner</p>
                        </div>
                        <div className="team-member">
                            <picture>
                                <source
                                    type="image/webp"
                                    srcSet="/media/team-joaquin-castro-400.webp 400w, /media/team-joaquin-castro-800.webp 682w"
                                    sizes="(max-width: 768px) 100vw, 360px"
                                />
                                <img
                                    src="/media/team-joaquin-castro-800.jpg"
                                    srcSet="/media/team-joaquin-castro-400.jpg 400w, /media/team-joaquin-castro-800.jpg 682w"
                                    sizes="(max-width: 768px) 100vw, 360px"
                                    alt="Joaquin Castro"
                                    width="682"
                                    height="1024"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </picture>
                            <h3>Joaquin Castro</h3>
                            <p>Founding Partner & Architect</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
