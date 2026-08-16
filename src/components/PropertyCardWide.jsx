import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, ArrowRight } from 'lucide-react';
import '../styles/PropertyCardWide.css';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import { generatePropertyPath } from '../utils/slugify';
import ShortlistButton from './ShortlistButton';

// `fetchpriority` is deliberately lowercase: React 18 does not recognise the
// camelCase spelling and warns on every render, though it forwards it either way.
const PropertyCardWide = ({ property, priority = false }) => {
    const propertyPath = generatePropertyPath(property);

    return (
        <Link to={propertyPath} className="property-card-wide">
            <div className="card-image-container">
                <img
                    src={getOptimizedImageUrl(
                        property.image || property.property_media?.find(m => m.type === 'image')?.url,
                        { width: 800, height: 600, resize: 'cover' }
                    )}
                    alt={property.title}
                    width={800}
                    height={600}
                    loading={priority ? "eager" : "lazy"}
                    decoding={priority ? "sync" : "async"}
                    fetchpriority={priority ? "high" : undefined}
                />
                <ShortlistButton property={property} />
                <div className="card-overlay">
                    <span className="card-type-badge">{property.type}</span>
                    <span className="card-price-badge">
                        {property.price_on_demand ? "Price On Demand" : `€${property.price.toLocaleString()}`}
                    </span>
                </div>
            </div>

            <div className="card-details-container">
                <div className="card-header">
                    <h3 className="card-title">{property.title}</h3>
                    <div className="card-location">
                        <MapPin size={16} />
                        <span>{property.location}, {property.city}</span>
                    </div>
                </div>

                <p className="card-excerpt">
                    {property.description ? property.description.substring(0, 150) + '...' : 'Luxury property available for viewing. Contact us for more details.'}
                </p>

                <div className="card-footer">
                    <div className="card-features">
                        <div className="feature-item">
                            <Bed size={18} />
                            <span>{property.bedrooms} Bed</span>
                        </div>
                        <div className="feature-item">
                            <Bath size={18} />
                            <span>{property.bathrooms} Bath</span>
                        </div>
                        <div className="feature-item">
                            <Maximize size={18} />
                            <span>{Number(property.area).toLocaleString()} m²</span>
                        </div>
                    </div>

                    <span className="view-details-btn">
                        View Details <ArrowRight size={16} />
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default PropertyCardWide;
