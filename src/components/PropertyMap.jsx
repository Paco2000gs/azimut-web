import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
// Bundled from the installed Leaflet rather than fetched from unpkg: the CDN
// copy was pinned to 1.7.1 while this project runs 1.9.x, and a blocked or slow
// CDN left the map with no markers at all.
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const PropertyMap = ({ lat, lng, title }) => {
    return (
        <MapContainer
            key={`${lat}-${lng}`}
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} icon={defaultIcon}>
                <Popup>{title}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default PropertyMap;
