import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useShortlist } from '../context/ShortlistContext';
import { useProperties } from '../context/PropertiesContext';
import { generatePropertyPath } from '../utils/slugify';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import SEO from '../components/SEO';
import '../styles/Shortlist.css';

const formatPrice = (property) => (
    property.price_on_demand ? 'On request' : `€${Number(property.price).toLocaleString('de-DE')}`
);

const formatPerSqm = (property) => {
    if (property.price_on_demand || !property.price || !property.area) return '—';
    return `€${Math.round(Number(property.price) / Number(property.area)).toLocaleString('de-DE')}/m²`;
};

const formatPlot = (property) => {
    if (!property.plot || Number(property.plot) <= 0) return '—';
    const plot = Number(property.plot);
    return plot >= 10000
        ? `${(plot / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })} ha`
        : `${plot.toLocaleString()} m²`;
};

const Shortlist = () => {
    const { ids, remove, clear, count } = useShortlist();
    const { properties, loading } = useProperties();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Only ids are stored, so prices and details are always the current ones.
    // A property withdrawn from the market simply drops out of the comparison.
    const saved = ids
        .map(id => properties.find(p => String(p.id) === String(id)))
        .filter(Boolean);

    const enquiryHref = `mailto:info@azimutproperty.com?subject=${encodeURIComponent('Dossier request: ' + saved.length + ' estates')}&body=${encodeURIComponent(
        'I would like the private dossiers for the following estates:\n\n' +
        saved.map(p => `• ${p.title} — ${p.city}, ${p.province}`).join('\n') +
        '\n\n'
    )}`;

    const rows = [
        { label: 'Price', render: formatPrice },
        { label: 'Price per m²', render: formatPerSqm },
        { label: 'Built', render: p => (p.area ? `${Number(p.area).toLocaleString()} m²` : '—') },
        { label: 'Plot', render: formatPlot },
        { label: 'Bedrooms', render: p => p.bedrooms || '—' },
        { label: 'Bathrooms', render: p => p.bathrooms || '—' },
        { label: 'Location', render: p => `${p.city}, ${p.province}` },
        { label: 'Type', render: p => p.type || '—' },
    ];

    return (
        <div className="page shortlist-page">
            <SEO
                title="Your Shortlist"
                description="The estates you have saved, side by side."
                url="/shortlist"
                noindex={true}
                lang="en"
            />

            <div className="container">
                <header className="shortlist-header">
                    <h1>Your shortlist</h1>
                    {count > 0 && (
                        <p className="shortlist-count">
                            {count} {count === 1 ? 'estate' : 'estates'} saved on this device
                        </p>
                    )}
                </header>

                {loading && ids.length > 0 && (
                    <p className="shortlist-status" role="status">Loading your saved estates…</p>
                )}

                {!loading && saved.length === 0 && (
                    <div className="shortlist-empty">
                        <h2>Nothing saved yet</h2>
                        <p>
                            Estates you save are kept here, side by side, so you can weigh price
                            against land and location without holding it all in your head. Nothing
                            leaves this device until you ask us for the dossiers.
                        </p>
                        <Link to="/venta" className="btn">Browse the portfolio</Link>
                    </div>
                )}

                {saved.length > 0 && (
                    <>
                        <div className="shortlist-table-scroll">
                            <table className="shortlist-table">
                                <caption className="visual-hidden">
                                    Saved estates compared by price, size, land and location
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col">
                                            <span className="visual-hidden">Attribute</span>
                                        </th>
                                        {saved.map(property => (
                                            <th scope="col" key={property.id}>
                                                <div className="shortlist-estate">
                                                    <Link to={generatePropertyPath(property)} className="shortlist-estate-media">
                                                        <img
                                                            src={getOptimizedImageUrl(property.image, { width: 400, height: 260, resize: 'cover' })}
                                                            alt=""
                                                            width={400}
                                                            height={260}
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </Link>
                                                    <Link to={generatePropertyPath(property)} className="shortlist-estate-title">
                                                        {property.title}
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="shortlist-remove"
                                                        onClick={() => remove(property.id)}
                                                        aria-label={`Remove ${property.title} from your shortlist`}
                                                    >
                                                        <X size={15} aria-hidden="true" />
                                                        <span>Remove</span>
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map(row => (
                                        <tr key={row.label}>
                                            <th scope="row">{row.label}</th>
                                            {saved.map(property => (
                                                <td key={property.id}>{row.render(property)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="shortlist-actions">
                            <a href={enquiryHref} className="btn btn-gold">
                                Request the dossiers for {saved.length === 1 ? 'this estate' : `these ${saved.length} estates`}
                            </a>
                            <button type="button" className="shortlist-clear" onClick={clear}>
                                Clear the shortlist
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Shortlist;
