import React from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/About.css';
import SEO from '../components/SEO';

const About = () => {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Sobre nosotros", "item": "https://www.azimutproperty.com/about" }
        ]
    };

    return (
        <div className="page about">
            <SEO
                title="Sobre nosotros: inmobiliaria de lujo en Marbella y Andalucía | Azimut Property"
                description="Conozca al equipo de Azimut Property. Agencia boutique en Marbella y la Costa del Sol, especializada en villas de lujo, fincas y propiedades fuera de mercado."
                url="/about"
                lang="es"
                keywords="sobre Azimut Property, inmobiliaria de lujo Marbella, compradores internacionales Costa del Sol, inmobiliaria boutique"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>
            <div className="about-hero">
                <div className="container">
                    <h1>Redefinir el mercado inmobiliario de lujo</h1>
                    <p>Más que una agencia, somos sus socios para vivir el estilo de vida andaluz.</p>
                </div>
            </div>

            <div className="container about-content">
                <div className="about-grid">
                    <div className="about-text">
                        <h2>Nuestra historia</h2>
                        <p>Fundada en 2024, AzimutProperty nació del deseo de elevar la experiencia inmobiliaria en el sur de España. Entendimos que el mercado de lujo exige un nivel de servicio, discreción y experiencia que va más allá de la transacción.</p>
                        <p>Nuestro nombre, «Azimut», refleja nuestra misión: guiar a nuestros clientes hacia su horizonte perfecto. Tanto si busca una villa frente al mar en la costa gaditana como una finca histórica en la Sierra Norte de Sevilla, recorremos el mercado con precisión y cuidado.</p>
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
                                alt="Vista aérea de una finca andaluza: tejados de teja, piscina y jardín en terrazas sobre la ladera"
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
                        <h2>Nuestra filosofía</h2>
                        <p>Creemos que el verdadero lujo está en los detalles. No se trata solo de metros cuadrados o de servicios: se trata de la sensación de hogar. Nos tomamos el tiempo de entender su estilo de vida, sus gustos y sus sueños.</p>
                        <p>Nuestra cartera está rigurosamente seleccionada. Rechazamos más propiedades de las que aceptamos, para que cada inmueble que representamos cumpla nuestros altos estándares de calidad, diseño y ubicación.</p>
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
                                alt="La prensa original bajo el techo de madera restaurado de un antiguo molino de aceite andaluz"
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
                    <h2>Nuestro equipo</h2>
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
                            <p>Socio fundador</p>
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
                            <p>Socio fundador</p>
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
                            <p>Socio fundador y arquitecto</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
