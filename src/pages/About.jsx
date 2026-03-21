import React from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/About.css';
import joseImg from '../assets/team/jose-rey.png';
import franciscoImg from '../assets/team/francisco-garrido.jpg';
import joaquinImg from '../assets/team/joaquin-castro.png';
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
                        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop" alt="Luxury Interior" />
                    </div>
                </div>

                <div className="about-grid" style={{ direction: 'rtl' }}>
                    <div className="about-text" style={{ direction: 'ltr' }}>
                        <h2>Our Philosophy</h2>
                        <p>We believe that true luxury lies in the details. It's not just about square meters or amenities; it's about the feeling of a home. We take the time to understand your lifestyle, your tastes, and your dreams.</p>
                        <p>Our portfolio is strictly curated. We turn down more listings than we accept, ensuring that every property we represent meets our high standards of quality, design, and location.</p>
                    </div>
                    <div className="about-image">
                        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop" alt="Modern Architecture" />
                    </div>
                </div>
            </div>


            <div className="team-section">
                <div className="container">
                    <h2>Meet The Team</h2>
                    <div className="team-grid">
                        <div className="team-member">
                            <img src={joseImg} alt="Jose Rey" />
                            <h3>Jose Rey</h3>
                            <p>Founding Partner</p>
                        </div>
                        <div className="team-member">
                            <img src={franciscoImg} alt="Francisco Garrido" />
                            <h3>Francisco Garrido</h3>
                            <p>Founding Partner</p>
                        </div>
                        <div className="team-member">
                            <img src={joaquinImg} alt="Joaquin Castro" />
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
