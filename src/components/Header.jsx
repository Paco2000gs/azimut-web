import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../styles/Header.css';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`} role="banner">
            <div className="container header-container">
                <h1 className="visual-hidden">Luxury Real Estate in Andalusia | Azimut Property: Specialists in Marbella, Benahavís, and Estepona</h1>
                <Link to="/" className="logo" aria-label="Azimut Property - Home">
                    <img src="/azimut-logo-gold.png" alt="Azimut Property - Luxury Real Estate in Andalusia" className="logo-img" width="40" height="40" />
                    <span>AZIMUT<span className="logo-accent">PROPERTY</span></span>
                </Link>

                <nav className={`nav ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
                    <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
                    <NavLink to="/venta" onClick={() => setIsOpen(false)}>Properties</NavLink>
                    <NavLink to="/about" onClick={() => setIsOpen(false)}>About Us</NavLink>
                    <NavLink to="/blog" onClick={() => setIsOpen(false)}>Blog</NavLink>
                    <NavLink to="/contact" className="btn-nav" onClick={() => setIsOpen(false)}>Contact</NavLink>
                </nav>

                <button
                    className="menu-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={isOpen}
                    aria-controls="main-nav"
                >
                    {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                </button>
            </div>
        </header>
    );
};

export default Header;
