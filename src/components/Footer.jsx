import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook, Mail } from 'lucide-react';
import { CONTACT_EMAIL, contactMailto } from '../constants/contact';
import { useProperties } from '../context/PropertiesContext';
import { slugifyLocation } from '../utils/slugify';
import { typesIn } from '../utils/listingTypes';
import '../styles/Footer.css';

const FINCA_PROVINCES = ['cadiz', 'sevilla', 'malaga', 'huelva'];

const Footer = () => {
    const { properties } = useProperties();

    // A province holding only fincas has no separate finca page worth linking:
    // /venta/huelva/finca would list the same as /venta/huelva.
    const fincaLinks = FINCA_PROVINCES.flatMap((slug) => {
        const fincas = properties.filter(p => slugifyLocation(p.province) === slug && slugifyLocation(p.type) === 'finca');
        if (!fincas.length) return [];
        const { types } = typesIn(properties, slug);
        return [{ href: types.includes('finca') ? `/venta/${slug}/finca` : `/venta/${slug}`, name: fincas[0].province }];
    });

    return (
        // data-contact-cta-hide: the floating contact button steps aside while the
        // footer, which carries the address, is on screen (see ContactCTA).
        <footer className="footer" role="contentinfo" data-contact-cta-hide="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-column">
                        <div className="footer-logo">
                            {/* alt="" — the heading beside it already names the brand. */}
                            <img src="/azimut-logo-96.png" alt="" width="48" height="50" loading="lazy" decoding="async" />
                            <h3>AZIMUT PROPERTY</h3>
                        </div>
                        <p>Inmobiliaria exclusiva en Andalucía. Seleccionamos las mejores propiedades para clientes muy exigentes.</p>
                        <div className="contact-info">
                            <p><Mail size={16} aria-hidden="true" style={{ marginRight: '8px', display: 'inline' }} /> <a href={contactMailto()}>{CONTACT_EMAIL}</a></p>
                        </div>
                    </div>

                    {/* Clean URLs only, and only where there is stock. The old
                        /venta?type= links were parameter variants Google set
                        aside as duplicates of /venta, and plot and penthouse
                        had no listings at all. */}
                    {fincaLinks.length > 0 && (
                        <div className="footer-column">
                            <h3>Fincas por provincia</h3>
                            <ul className="footer-links">
                                {fincaLinks.map(({ href, name }) => (
                                    <li key={href}><Link to={href}>Fincas en {name}</Link></li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="footer-column">
                        <h3>Zonas</h3>
                        <ul className="footer-links">
                            <li><Link to="/venta/marbella">Marbella</Link></li>
                            <li><Link to="/venta/cadiz">Cádiz</Link></li>
                            <li><Link to="/venta/sevilla">Sevilla</Link></li>
                            <li><Link to="/venta/huelva">Huelva</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3>Colecciones</h3>
                        <ul className="footer-links">
                            <li><Link to="/es/villas-de-lujo-marbella">Villas de lujo en Marbella</Link></li>
                            <li><Link to="/es/mansiones-sotogrande">Mansiones en Sotogrande</Link></li>
                            <li><Link to="/es/fincas-ecuestres-jimena-de-la-frontera">Fincas ecuestres en Jimena</Link></li>
                            <li><Link to="/es/haciendas-y-olivares-sevilla">Haciendas y olivares en Sevilla</Link></li>
                            <li><Link to="/cortijos-en-venta-sevilla">Cortijos en venta en Sevilla</Link></li>
                            <li><Link to="/cortijos-en-venta-huelva">Cortijos en venta en Huelva</Link></li>
                            <li><Link to="/cortijos-en-venta-cadiz">Cortijos en venta en Cádiz</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3>Empresa</h3>
                        <ul className="footer-links">
                            <li><Link to="/about">Sobre nosotros</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/buying-guide">Comprar en España</Link></li>
                            <li><Link to="/contact">Contacto</Link></li>
                            <li><Link to="/privacy">Política de privacidad</Link></li>
                            <li><Link to="/terms">Condiciones de uso</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Strategic Partner */}
                <div className="footer-partner">
                    <span className="partner-label">Socio estratégico</span>
                    <span className="partner-divider" aria-hidden="true"></span>
                    <a
                        href="https://www.dudley-estates.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="partner-link"
                    >
                        Dudley Estates
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ marginLeft: '6px', opacity: 0.5 }}>
                            <path d="M3.5 1.5H10.5V8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </a>
                </div>

                <div className="footer-bottom">
                    <div className="copyright">
                        &copy; {new Date().getFullYear()} Azimut Property. All rights reserved.
                    </div>
                    <div className="social-links">
                        <a href="https://www.instagram.com/azimutproperty" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                            <Instagram size={20} aria-hidden="true" />
                        </a>
                        <a href="https://www.linkedin.com/company/azimutproperty" target="_blank" rel="noopener noreferrer" aria-label="Follow us on LinkedIn">
                            <Linkedin size={20} aria-hidden="true" />
                        </a>
                        <a href="https://www.facebook.com/azimutproperty" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook">
                            <Facebook size={20} aria-hidden="true" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
