import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound = () => {
    return (
        <div className="page not-found" style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <SEO title="Page Not Found" noindex={true} lang="en" />
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--ink-800)' }}>404</h1>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--ink-500)' }}>Page Not Found</h2>
            <p style={{ marginBottom: '2rem', maxWidth: '400px', color: 'var(--ink-400)' }}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link to="/" className="btn">Return Home</Link>
        </div>
    );
};

export default NotFound;
