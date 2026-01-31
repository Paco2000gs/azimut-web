import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { generatePropertySlug } from '../utils/slugify';
import '../styles/PropertyCard.css';

const PropertyCard = ({ property }) => {
    const slug = generatePropertySlug(property);

    return (
        <Link to={`/property/${slug}`} className="property-card">
            <div className="card-image">
                <img
                    src={property.image || property.property_media?.find(m => m.type === 'image')?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={property.title}
                    loading="lazy"
                />
                <span className="card-tag">{property.type}</span>
                <span className="card-price">
                    {property.price_on_demand ? "Price On Demand" : `€${property.price.toLocaleString()}`}
                </span>
            </div>
            <div className="card-content">
                <h3 className="card-title">{property.title}</h3>
                <div className="card-location">
                    <MapPin size={14} />
                    <span>{property.location}</span>
                </div>
                <div className="card-features">
                    <div className="feature">
                        <Bed size={16} />
                        <span>{property.bedrooms}</span>
                    </div>
                    <div className="feature">
                        <Bath size={16} />
                        <span>{property.bathrooms}</span>
                    </div>
                    <div className="feature">
                        <Maximize size={16} />
                        <span>{Number(property.area).toLocaleString()} m²</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PropertyCard;
