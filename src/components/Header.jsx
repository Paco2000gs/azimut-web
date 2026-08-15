import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import '../styles/Header.css';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const headerRef = useRef(null);
    const toggleRef = useRef(null);

    // Whether the page below opens on a dark hero decides the header's palette.
    // Written straight to the DOM rather than to state: the hero only exists once
    // the route's children have rendered, so a state round-trip would repaint.
    useLayoutEffect(() => {
        const el = headerRef.current;
        if (!el) return;
        el.dataset.overHero = document.querySelector('.hero') ? 'true' : 'false';
    }, [location.pathname]);

    useEffect(() => {
        const el = headerRef.current;
        const id = requestAnimationFrame(() => {
            if (el) el.dataset.ready = 'true';
        });
        return () => cancelAnimationFrame(id);
    }, []);

    useEffect(() => {
        const el = headerRef.current;
        const onScroll = () => {
            if (el) el.dataset.scrolled = window.scrollY > 50 ? 'true' : 'false';
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            setIsOpen(false);
            toggleRef.current?.focus();
        };
        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const closeMenu = () => setIsOpen(false);

    return (
        <header
            ref={headerRef}
            className={`header ${isOpen ? 'menu-open' : ''}`}
            data-over-hero="false"
            data-scrolled="false"
            role="banner"
        >
            <div className="container header-container">
                <Link to="/" className="logo" aria-label="Azimut Property - Home" onClick={closeMenu}>
                    <img src="/azimut-logo-96.png" alt="" className="logo-img" width="48" height="50" />
                    <span>AZIMUT<span className="logo-accent">PROPERTY</span></span>
                </Link>

                <nav id="main-nav" className={`nav ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
                    <NavLink to="/" onClick={closeMenu}>Home</NavLink>
                    <NavLink to="/venta" onClick={closeMenu}>Properties</NavLink>
                    <NavLink to="/venta?type=finca" onClick={closeMenu}>Rural Estates</NavLink>
                    <NavLink to="/about" onClick={closeMenu}>About Us</NavLink>
                    <NavLink to="/blog" onClick={closeMenu}>Journal</NavLink>
                    <NavLink to="/contact" className="btn-nav" onClick={closeMenu}>Contact</NavLink>
                </nav>

                <button
                    ref={toggleRef}
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
