import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProperties } from '../context/PropertiesContext';
import { MapPin, Bed, Bath, Maximize, Printer, Phone, Mail, Globe } from 'lucide-react'; // Import icons
// import { getOptimizedImageUrl } from '../utils/imageOptimizer'; // Keep consistent if available
import '../styles/DossierView.css';

const DossierView = () => {
    const { id } = useParams();
    const { getPropertyById, getPropertyMedia } = useProperties();
    const [property, setProperty] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const prop = getPropertyById(id);
            if (prop) {
                setProperty(prop);

                // Get media
                const mediaResult = await getPropertyMedia(id);
                let loadedImages = [];
                if (mediaResult.success) {
                    loadedImages = mediaResult.data.filter(m => m.type === 'image');
                }

                // Ensure main image is included if not in media list
                if (prop.image && !loadedImages.find(img => img.url === prop.image)) {
                    loadedImages.unshift({ url: prop.image, id: 'main', type: 'image' });
                }

                setImages(loadedImages);
            }
            setLoading(false);
        };
        loadData();
    }, [id, getPropertyById, getPropertyMedia]);

    if (loading) return <div className="dossier-loading">Generando Dossier...</div>;
    if (!property) return <div className="dossier-error">Propiedad no encontrada</div>;

    // Filter to top 5 images for the grid (avoid overcrowding)
    const galleryImages = images.slice(0, 5);

    return (
        <div className="dossier-page">
            {/* Print Button (Hidden in Print) */}
            <div className="dossier-actions no-print">
                <button onClick={() => window.print()} className="print-btn">
                    <Printer size={20} /> Imprimir / Guardar PDF
                </button>
            </div>

            <div className="dossier-container">
                {/* HEAD: Branding & Header */}
                <header className="dossier-header">
                    <div className="brand-logo">
                        <h1>AZIMUT</h1>
                        <span>REAL ESTATE</span>
                    </div>
                    <div className="contact-info">
                        <div className="contact-item"><Phone size={14} /> +34 999 999 999</div>
                        <div className="contact-item"><Mail size={14} /> info@azimutproperty.com</div>
                        <div className="contact-item"><Globe size={14} /> www.azimutproperty.com</div>
                    </div>
                </header>

                {/* HERO: Main Image & Title */}
                <section className="dossier-hero">
                    <div className="hero-image-container">
                        <img
                            src={property.image || 'https://via.placeholder.com/1200x800'}
                            alt={property.title}
                            className="hero-image"
                        />
                        <div className="hero-overlay">
                            <h2 className="property-title">{property.title}</h2>
                            <div className="property-location">
                                <MapPin size={18} /> {property.city}, {property.province}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SPECS GRID */}
                <section className="dossier-specs">
                    <div className="spec-item">
                        <span className="spec-label">Precio</span>
                        <span className="spec-value price">
                            {property.price_on_demand ? "Consultar" : `€${property.price?.toLocaleString()}`}
                        </span>
                    </div>
                    <div className="spec-item">
                        <Bed size={20} />
                        <span className="spec-value">{property.bedrooms} Dormitorios</span>
                    </div>
                    <div className="spec-item">
                        <Bath size={20} />
                        <span className="spec-value">{property.bathrooms} Baños</span>
                    </div>
                    <div className="spec-item">
                        <Maximize size={20} />
                        <span className="spec-value">{property.area} m²</span>
                    </div>
                    {property.plot > 0 && (
                        <div className="spec-item">
                            {/* Icon for plot if needed */}
                            <span className="spec-label">Parcela</span>
                            <span className="spec-value">{property.plot} m²</span>
                        </div>
                    )}
                </section>

                {/* CONTENT: Description & Features */}
                <div className="dossier-content">
                    <div className="description-column">
                        <h3>Descripción</h3>
                        <p>{property.description}</p>
                    </div>

                    <div className="features-column">
                        <h3>Características</h3>
                        <ul className="features-list">
                            {property.features?.map((feat, idx) => (
                                <li key={idx}>{feat}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* GALLERY GRID */}
                <section className="dossier-gallery">
                    <h3>Galería</h3>
                    <div className="gallery-grid">
                        {galleryImages.map((img, idx) => (
                            <div key={idx} className="gallery-item">
                                <img src={img.url} alt={`View ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="dossier-footer">
                    <p>Azimut Real Estate - Su socio de confianza en propiedades exclusivas.</p>
                </footer>
            </div>
        </div>
    );
};

export default DossierView;
