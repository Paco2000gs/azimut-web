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
            <SEO title="Página no encontrada" noindex={true} lang="es" />
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--ink-800)' }}>404</h1>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--ink-500)' }}>Página no encontrada</h2>
            <p style={{ marginBottom: '2rem', maxWidth: '400px', color: 'var(--ink-400)' }}>
                La página que busca puede haber sido eliminada, haber cambiado de nombre o no estar disponible temporalmente.
            </p>
            <Link to="/" className="btn">Volver al inicio</Link>
        </div>
    );
};

export default NotFound;
