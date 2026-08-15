import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProperties } from '../context/PropertiesContext';
import { MapPin, Bed, Bath, Maximize, Printer, Mail, Globe } from 'lucide-react'; // Import icons
// import { getOptimizedImageUrl } from '../utils/imageOptimizer'; // Keep consistent if available
import '../styles/DossierView.css';

const DossierView = () => {
    const { id } = useParams();
    const { getPropertyById, getPropertyMedia } = useProperties();
    const [property, setProperty] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const calculateCosts = (price) => {
        if (!price || price === 0) return null;
        const itp = price * 0.10; // 10% ITP (General approximation)
        const notary = 850 + (price * 0.001); // Approx estimation
        const registry = 450 + (price * 0.001); // Approx estimation
        const total = itp + notary + registry;
        return { itp, notary, registry, total };
    };

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

    if (loading) return <div className="dossier-loading">Generating Dossier...</div>;
    if (!property) return <div className="dossier-error">Property not found</div>;



    return (
        <div className="dossier-page">
            {/* Print Button (Hidden in Print) */}
            <div className="dossier-actions no-print">
                <button onClick={() => window.print()} className="print-btn">
                    <Printer size={20} /> Print / Save PDF
                </button>
            </div>

            <div className="dossier-container">
                {/* HEAD: Branding & Header */}
                <header className="dossier-header">
                    <div className="brand-logo">
                        <img src="/assets/azimut-logos.png" alt="Azimut Real Estate" className="logo-img" />
                    </div>
                    <div className="contact-info">
                        <div className="contact-item"><Mail size={14} /> info@azimutproperty.com</div>
                        <div className="contact-item"><Globe size={14} /> www.azimutproperty.com</div>
                    </div>
                </header>

                {/* PAGE 1 CONTENT */}
                <div className="dossier-section page-1">
                    {/* HERO IMAGE (No textual overlay) */}
                    <div className="hero-image-container-clean">
                        <img
                            src={property.image || '/media/placeholder.svg'}
                            alt={property.title}
                            className="hero-image-clean"
                        />
                    </div>

                    {/* TITLE & INFO BLOCK */}
                    <div className="property-header-block">
                        <h2 className="property-title-clean">{property.title}</h2>
                        <div className="property-location-clean">
                            <MapPin size={20} /> {property.city}, {property.province}
                        </div>
                    </div>

                    {/* SPECS GRID */}
                    <section className="dossier-specs">
                        <div className="spec-item">
                            <span className="spec-label">Price</span>
                            <span className="spec-value price">
                                {property.price_on_demand ? "On Demand" : `€${property.price?.toLocaleString()}`}
                            </span>
                        </div>
                        <div className="spec-item">
                            <Bed size={20} />
                            <span className="spec-value">{property.bedrooms} Bedrooms</span>
                        </div>
                        <div className="spec-item">
                            <Bath size={20} />
                            <span className="spec-value">{property.bathrooms} Bathrooms</span>
                        </div>
                        <div className="spec-item">
                            <Maximize size={20} />
                            <span className="spec-value">{property.area} m²</span>
                        </div>
                        {property.plot > 0 && (
                            <div className="spec-item">
                                <span className="spec-label">Plot</span>
                                <span className="spec-value">{property.plot} m²</span>
                            </div>
                        )}
                    </section>

                    {/* PURCHASE COSTS ESTIMATOR */}
                    {calculateCosts(property.price) && (
                        <section className="dossier-costs">
                            <h3>Purchase Costs Estimation</h3>
                            <p className="costs-disclaimer">*Approximate calculation (ITP 10% + Notary + Registry). No contractual value.</p>
                            <div className="costs-grid">
                                <div className="cost-item">
                                    <span>Property Price</span>
                                    <strong>€{property.price.toLocaleString()}</strong>
                                </div>
                                <div className="cost-item">
                                    <span>Taxes (ITP 10%)</span>
                                    <span>€{calculateCosts(property.price).itp.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="cost-item">
                                    <span>Notary (Est.)</span>
                                    <span>€{calculateCosts(property.price).notary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="cost-item">
                                    <span>Registry (Est.)</span>
                                    <span>€{calculateCosts(property.price).registry.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="cost-item total">
                                    <span>Estimated Total</span>
                                    <strong>€{(property.price + calculateCosts(property.price).total).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* PAGE BREAK */}
                <div className="page-break"></div>

                {/* PAGE 2 CONTENT: TEXT & FEATURES */}
                <div className="dossier-section page-2">
                    <div className="dossier-content-full">
                        <div className="description-section">
                            <h3>Description</h3>
                            <p>{property.description}</p>
                        </div>

                        <div className="features-section">
                            <h3>Features</h3>
                            <ul className="features-list-grid">
                                {property.features?.map((feat, idx) => (
                                    <li key={idx}>{feat}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* PAGE BREAK */}
                <div className="page-break"></div>

                {/* PAGE 3 CONTENT: GALLERY */}
                <div className="dossier-section page-3">
                    <section className="dossier-gallery-full">
                        <h3>Gallery</h3>
                        <div className="gallery-grid-full">
                            {/* Show more images for the full page, e.g. 6-8 */}
                            {images.slice(0, 8).map((img, idx) => (
                                <div key={idx} className="gallery-item-full">
                                    <img src={img.url} alt={`View ${idx + 1}`} />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* FOOTER */}
                <footer className="dossier-footer">
                    <p>Azimut Real Estate - Your trusted partner in exclusive properties.</p>
                </footer>
            </div>
        </div>
    );
};

export default DossierView;
