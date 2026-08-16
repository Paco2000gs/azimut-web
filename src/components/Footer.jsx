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
                            {/* alt="" — the heading beside it already names the brand. */}
                            <img src="/azimut-logo-96.png" alt="" width="48" height="50" loading="lazy" decoding="async" />
                            <h3>AZIMUT PROPERTY</h3>
                        </div>
                        <p>Exclusive real estate in Andalusia. We curate the finest properties for the most discerning clients.</p>
                        <div className="contact-info">
                            <p><Mail size={16} aria-hidden="true" style={{ marginRight: '8px', display: 'inline' }} /> <a href="mailto:info@azimutproperty.com">info@azimutproperty.com</a></p>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h3>Property Types</h3>
                        <ul className="footer-links">
                            <li><Link to="/venta?type=finca">Fincas & Cortijos</Link></li>
                            <li><Link to="/venta?type=plot">Land & Plots</Link></li>
                            <li><Link to="/venta?type=villa">Luxury Villas</Link></li>
                            <li><Link to="/venta?type=penthouse">Penthouses</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3>Key Areas</h3>
                        <ul className="footer-links">
                            <li><Link to="/venta/marbella">Marbella</Link></li>
                            <li><Link to="/venta/cadiz">Cádiz</Link></li>
                            <li><Link to="/venta/sevilla">Sevilla</Link></li>
                            <li><Link to="/venta/huelva">Huelva</Link></li>
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

                {/* Strategic Partner */}
                <div className="footer-partner">
                    <span className="partner-label">Strategic Partner</span>
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
