/**
 * Geocodifica una dirección usando OpenStreetMap Nominatim API
 * @param {string} address - La dirección completa a geocodificar
 * @returns {Promise<{lat: number, lon: number}|null>} - Coordenadas o null si falla
 */
export const geocodeAddress = async (address) => {
    try {
        const query = encodeURIComponent(address);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);

        if (!response.ok) {
            throw new Error('Error en el servicio de geocodificación');
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }

        return null;
    } catch (error) {
        console.error('Error geocoding address:', error);
        return null;
    }
};
