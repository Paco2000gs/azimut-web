import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
    return (
        <div className="app-wrapper">
            <a href="#main" className="skip-link">Skip to content</a>
            <Header />
            {/* tabIndex -1 so the skip link can move focus here, not just scroll. */}
            <main id="main" className="main-content" tabIndex={-1}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
