import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook, Mail, Phone } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer" role="contentinfo">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-column">
                        <div className="footer-logo">
                            <img src="/azimut-logo-gold.png" alt="Azimut Property - Inmobiliaria de lujo" width="48" height="48" />
                            <h3>AZIMUT PROPERTY</h3>
                        </div>
                        <p>Inmobiliaria exclusiva en Andalucía. Seleccionamos las mejores propiedades para los clientes más exigentes.</p>
                        <div className="contact-info">
                            <p><Mail size={16} aria-hidden="true" style={{ marginRight: '8px', display: 'inline' }} /> <a href="mailto:info@azimutproperty.com">info@azimutproperty.com</a></p>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h3>Descubrir</h3>
                        <ul className="footer-links">
                            <li><Link to="/catalog">Propiedades</Link></li>
                            <li><Link to="/catalog?type=villa">Villas</Link></li>
                            <li><Link to="/catalog?type=penthouse">Áticos</Link></li>
                            <li><Link to="/catalog?type=finca">Fincas</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3>Empresa</h3>
                        <ul className="footer-links">
                            <li><Link to="/about">Sobre Nosotros</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/contact">Contacto</Link></li>
                            <li><Link to="/privacy">Política de Privacidad</Link></li>
                            <li><Link to="/terms">Términos de Servicio</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="copyright">
                        &copy; {new Date().getFullYear()} Azimut Property. Todos los derechos reservados.
                    </div>
                    <div className="social-links">
                        <a href="https://www.instagram.com/azimutproperty" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Instagram">
                            <Instagram size={20} aria-hidden="true" />
                        </a>
                        <a href="https://www.linkedin.com/company/azimutproperty" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en LinkedIn">
                            <Linkedin size={20} aria-hidden="true" />
                        </a>
                        <a href="https://www.facebook.com/azimutproperty" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Facebook">
                            <Facebook size={20} aria-hidden="true" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
