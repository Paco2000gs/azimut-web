import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook, Youtube, Mail } from 'lucide-react';
import '../styles/Footer.css';

// Profile URLs come from the build env (VITE_SOCIAL_*). A network with no URL
// is not rendered at all: an icon pointing at a profile that doesn't exist yet
// is a broken link (linkedin.com/company/azimutproperty was a 404).
const SOCIAL_LINKS = [
    { url: import.meta.env.VITE_SOCIAL_INSTAGRAM_URL, label: 'Instagram', Icon: Instagram },
    { url: import.meta.env.VITE_SOCIAL_LINKEDIN_URL, label: 'LinkedIn', Icon: Linkedin },
    { url: import.meta.env.VITE_SOCIAL_FACEBOOK_URL, label: 'Facebook', Icon: Facebook },
    { url: import.meta.env.VITE_SOCIAL_YOUTUBE_URL, label: 'YouTube', Icon: Youtube },
].filter(s => /^https:\/\//.test(s.url || ''));

const Footer = () => {
    return (
        <footer className="footer" role="contentinfo">
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
                            <p><Mail size={16} aria-hidden="true" style={{ marginRight: '8px', display: 'inline' }} /> <a href="mailto:info@azimutproperty.com">info@azimutproperty.com</a></p>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h3>Tipos de inmueble</h3>
                        <ul className="footer-links">
                            <li><Link to="/venta?type=finca">Fincas y cortijos</Link></li>
                            <li><Link to="/venta?type=plot">Terrenos y parcelas</Link></li>
                            <li><Link to="/venta?type=villa">Villas de lujo</Link></li>
                            <li><Link to="/venta?type=penthouse">Áticos</Link></li>
                        </ul>
                    </div>

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
                    {SOCIAL_LINKS.length > 0 && (
                        <div className="social-links">
                            {SOCIAL_LINKS.map(s => (
                                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Follow us on ${s.label}`}>
                                    <s.Icon size={20} aria-hidden="true" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
