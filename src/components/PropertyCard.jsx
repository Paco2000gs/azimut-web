import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { generatePropertyPath } from '../utils/slugify';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import ShortlistButton from './ShortlistButton';
import '../styles/PropertyCard.css';

// The admin often leaves `location` empty: build the line from whatever is filled in,
// without repeating a value or leaving a stray comma.
const locationLine = (p) =>
    [...new Set([p.location, p.city, p.province].map(v => v?.trim()).filter(Boolean))].join(', ');

const PropertyCard = ({ property }) => {
    const propertyPath = generatePropertyPath(property);
    const imgUrl = property.image || property.property_media?.find(m => m.type === 'image')?.url || '';
    const altText = `${property.type} en ${property.city} — ${property.bedrooms} dormitorios, ${Number(property.area).toLocaleString()} m²`;

    return (
        <Link to={propertyPath} className="property-card">
            <div className="card-image">
                <img
                    src={getOptimizedImageUrl(imgUrl, { width: 400, height: 300, resize: 'cover' })}
                    srcSet={`${getOptimizedImageUrl(imgUrl, { width: 400, height: 300, resize: 'cover' })} 400w, ${getOptimizedImageUrl(imgUrl, { width: 800, height: 600, resize: 'cover' })} 800w`}
                    sizes="(max-width: 768px) 100vw, 400px"
                    alt={altText}
                    width={400}
                    height={300}
                    loading="lazy"
                />
                <ShortlistButton property={property} />
                <span className="card-tag">{property.type}</span>
                <span className="card-price">
                    {property.price_on_demand ? "Precio a consultar" : `€${property.price.toLocaleString()}`}
                </span>
            </div>
            <div className="card-content">
                <h3 className="card-title">{property.title}</h3>
                {locationLine(property) && (
                    <div className="card-location">
                        <MapPin size={14} aria-hidden="true" />
                        <span>{locationLine(property)}</span>
                    </div>
                )}
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
