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
    property.price_on_demand ? 'A consultar' : `€${Number(property.price).toLocaleString('de-DE')}`
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

    const enquiryHref = `mailto:info@azimutproperty.com?subject=${encodeURIComponent('Solicitud de dossier: ' + saved.length + ' inmuebles')}&body=${encodeURIComponent(
        'Me gustaría recibir los dossiers privados de los siguientes inmuebles:\n\n' +
        saved.map(p => `• ${p.title} — ${p.city}, ${p.province}`).join('\n') +
        '\n\n'
    )}`;

    const rows = [
        { label: 'Precio', render: formatPrice },
        { label: 'Precio por m²', render: formatPerSqm },
        { label: 'Construidos', render: p => (p.area ? `${Number(p.area).toLocaleString()} m²` : '—') },
        { label: 'Parcela', render: formatPlot },
        { label: 'Dormitorios', render: p => p.bedrooms || '—' },
        { label: 'Baños', render: p => p.bathrooms || '—' },
        { label: 'Ubicación', render: p => `${p.city}, ${p.province}` },
        { label: 'Tipo', render: p => p.type || '—' },
    ];

    return (
        <div className="page shortlist-page">
            <SEO
                title="Sus favoritos"
                description="Los inmuebles que ha guardado, uno junto a otro."
                url="/shortlist"
                noindex={true}
                lang="es"
            />

            <div className="container">
                <header className="shortlist-header">
                    <h1>Sus favoritos</h1>
                    {count > 0 && (
                        <p className="shortlist-count">
                            {count} {count === 1 ? 'inmueble guardado' : 'inmuebles guardados'} en este dispositivo
                        </p>
                    )}
                </header>

                {loading && ids.length > 0 && (
                    <p className="shortlist-status" role="status">Cargando sus inmuebles guardados…</p>
                )}

                {!loading && saved.length === 0 && (
                    <div className="shortlist-empty">
                        <h2>Todavía no hay nada guardado</h2>
                        <p>
                            Los inmuebles que guarde se muestran aquí, uno junto a otro, para comparar
                            precio frente a terreno y ubicación sin tener que recordarlo todo. Nada
                            sale de este dispositivo hasta que nos pida los dossiers.
                        </p>
                        <Link to="/venta" className="btn">Ver la cartera</Link>
                    </div>
                )}

                {saved.length > 0 && (
                    <>
                        <div className="shortlist-table-scroll">
                            <table className="shortlist-table">
                                <caption className="visual-hidden">
                                    Inmuebles guardados comparados por precio, superficie, terreno y ubicación
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col">
                                            <span className="visual-hidden">Atributo</span>
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
                                                        aria-label={`Quitar ${property.title} de sus favoritos`}
                                                    >
                                                        <X size={15} aria-hidden="true" />
                                                        <span>Quitar</span>
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
                                Solicitar los dossiers de {saved.length === 1 ? 'este inmueble' : `estos ${saved.length} inmuebles`}
                            </a>
                            <button type="button" className="shortlist-clear" onClick={clear}>
                                Vaciar favoritos
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Shortlist;
