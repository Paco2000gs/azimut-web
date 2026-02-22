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
                            <img src="/azimut-logo-gold.png" alt="Azimut Property - Luxury Real Estate" width="48" height="48" />
                            <h3>AZIMUT PROPERTY</h3>
                        </div>
                        <p>Exclusive real estate in Andalusia. We curate the finest properties for the most discerning clients.</p>
                        <div className="contact-info">
                            <p><Mail size={16} aria-hidden="true" style={{ marginRight: '8px', display: 'inline' }} /> <a href="mailto:info@azimutproperty.com">info@azimutproperty.com</a></p>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h3>Discover</h3>
                        <ul className="footer-links">
                            <li><Link to="/venta">Properties for Sale</Link></li>
                            <li><Link to="/venta?type=villa">Luxury Villas</Link></li>
                            <li><Link to="/venta?type=penthouse">Exclusive Penthouses</Link></li>
                            <li><Link to="/venta?type=finca">Country Fincas</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3>Key Areas</h3>
                        <ul className="footer-links">
                            <li><Link to="/venta/marbella">Marbella</Link></li>
                            <li><Link to="/venta/benahavis">Benahavís</Link></li>
                            <li><Link to="/venta/estepona">Estepona</Link></li>
                            <li><Link to="/venta/marbella/golden-mile">Golden Mile</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3>Company</h3>
                        <ul className="footer-links">
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
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
