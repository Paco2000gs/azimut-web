import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook, Mail } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-column">
                        <div className="footer-logo">
                            <img src="/azimut-logo-gold.png" alt="Azimut Property" />
                            <h3>AZIMUT PROPERTY</h3>
                        </div>
                        <p>Exclusive real estate in Andalusia. We curate the finest homes for the most discerning clients.</p>
                        <div className="contact-info">
                            <p><Mail size={16} style={{ marginRight: '8px', display: 'inline' }} /> info@azimutproperty.com</p>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h3>Discover</h3>
                        <ul className="footer-links">
                            <li><Link to="/catalog">Properties</Link></li>
                            <li><Link to="/catalog?type=villa">Villas</Link></li>
                            <li><Link to="/catalog?type=penthouse">Penthouses</Link></li>
                            <li><Link to="/catalog?type=finca">Fincas</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3>Company</h3>
                        <ul className="footer-links">
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/blog">Journal</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="copyright">
                        &copy; {new Date().getFullYear()} AzimutProperty. All rights reserved.
                    </div>
                    <div className="social-links">
                        <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                        <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
                        <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
