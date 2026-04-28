import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ customItems }) => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // If customItems are provided, use them instead of auto-generating from path
    if (customItems) {
        return (
            <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem' }}>
                <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, alignItems: 'center', fontSize: '0.875rem', color: '#64748b', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    <li style={{ display: 'flex', alignItems: 'center' }}>
                        <Link to="/" style={{ color: 'inherit', display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Inicio">
                            <Home size={14} />
                        </Link>
                    </li>
                    {customItems.map((item, index) => (
                        <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <ChevronRight size={14} style={{ margin: '0 0.5rem', opacity: 0.5 }} />
                            {item.link ? (
                                <Link to={item.link} style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {item.label}
                                </Link>
                            ) : (
                                <span style={{ color: '#1e293b', fontWeight: '500' }}>{item.label}</span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        );
    }

    // Auto-generation logic (fallback)
    return (
        <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem' }}>
            <ol style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, alignItems: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                <li style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/" style={{ color: 'inherit', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <Home size={14} />
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

                    return (
                        <li key={to} style={{ display: 'flex', alignItems: 'center' }}>
                            <ChevronRight size={14} style={{ margin: '0 0.5rem', opacity: 0.5 }} />
                            {last ? (
                                <span style={{ color: '#1e293b', fontWeight: '500' }}>{label}</span>
                            ) : (
                                <Link to={to} style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
