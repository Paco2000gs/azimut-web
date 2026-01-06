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
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <div className="container header-container">
                <Link to="/" className="logo">
                    <img src="/azimut-logo-gold.png" alt="Azimut Logo" className="logo-img" />
                    <span>AZIMUT<span className="logo-accent">PROPERTY</span></span>
                </Link>

                <nav className={`nav ${isOpen ? 'open' : ''}`}>
                    <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
                    <NavLink to="/catalog" onClick={() => setIsOpen(false)}>Properties</NavLink>
                    <NavLink to="/about" onClick={() => setIsOpen(false)}>About Us</NavLink>
                    <NavLink to="/blog" onClick={() => setIsOpen(false)}>Journal</NavLink>
                    <NavLink to="/contact" className="btn-nav" onClick={() => setIsOpen(false)}>Contact</NavLink>
                </nav>

                <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>
        </header>
    );
};

export default Header;
