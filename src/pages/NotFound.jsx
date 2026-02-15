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
            <SEO title="Página No Encontrada" noindex={true} />
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: '#1e293b' }}>404</h1>
            <h2 style={{ marginBottom: '1.5rem', color: '#64748b' }}>Page Not Found</h2>
            <p style={{ marginBottom: '2rem', maxWidth: '400px', color: '#94a3b8' }}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link to="/" className="btn">Return Home</Link>
        </div>
    );
};

export default NotFound;
