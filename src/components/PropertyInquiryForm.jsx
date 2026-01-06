import React, { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import '../styles/PropertyInquiryForm.css';
import { Send, CheckCircle } from 'lucide-react';

const PropertyInquiryForm = ({ propertyId, propertyTitle }) => {
    const { addLead } = useLeads();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        budget: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const fullMessage = `
Presupuesto: ${formData.budget || 'No especificado'}
Mensaje: ${formData.message || 'Solicitud de información.'}
        `.trim();

        try {
            await addLead({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                interest: `Interés en Propiedad: ${propertyTitle}`,
                message: fullMessage,
                source: 'Property Detail',
                property_title: propertyTitle
            });
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', budget: '', message: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error al enviar. Por favor intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (submitted) {
        return (
            <div className="inquiry-success">
                <CheckCircle size={48} color="#10b981" />
                <h3>¡Solicitud Recibida!</h3>
                <p>Le enviaremos el dossier privado a su correo en breve.</p>
                <button onClick={() => setSubmitted(false)} className="btn-text">
                    Enviar otra consulta
                </button>
            </div>
        );
    }

    return (
        <div className="property-inquiry-form">
            <div className="form-header">
                <h3>Solicitar Dossier Privado</h3>
                <p>Reciba información detallada y confidencial sobre esta propiedad.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        name="name"
                        placeholder="Nombre Completo"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="minimal-input"
                    />
                </div>

                <div className="form-group">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Preferente"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="minimal-input"
                    />
                </div>

                <div className="form-group">
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Teléfono (Opcional)"
                        value={formData.phone}
                        onChange={handleChange}
                        className="minimal-input"
                    />
                </div>

                <div className="form-group">
                    <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="minimal-input"
                        required
                    >
                        <option value="" disabled>Rango de Inversión</option>
                        <option value="< 500k">Menos de €500k</option>
                        <option value="500k - 1M">€500k - €1M</option>
                        <option value="1M - 3M">€1M - €3M</option>
                        <option value="> 3M">Más de €3M</option>
                    </select>
                </div>

                <div className="form-group">
                    <textarea
                        name="message"
                        placeholder="Mensaje breve (opcional)"
                        value={formData.message}
                        onChange={handleChange}
                        className="minimal-input"
                        rows="2"
                    ></textarea>
                </div>

                <button type="submit" className="btn-gold-full" disabled={loading}>
                    {loading ? 'Enviando...' : 'Solicitar Dossier'}
                </button>

                <p className="privacy-note">
                    * Sus datos serán tratados con estricta confidencialidad.
                </p>
            </form>
        </div>
    );
};

export default PropertyInquiryForm;
