import React, { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import '../styles/PropertyInquiryForm.css';
import { Send, CheckCircle } from 'lucide-react';

const PropertyInquiryForm = ({ propertyTitle }) => {
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
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const fullMessage = `
Budget: ${formData.budget || 'Not specified'}
Message: ${formData.message || 'Information request.'}
        `.trim();

        try {
            await addLead({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                interest: `Interest in Property: ${propertyTitle}`,
                message: fullMessage,
                source: 'Property Detail',
                property_title: propertyTitle
            });
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', budget: '', message: '' });
        } catch (err) {
            console.error('Error submitting form:', err);
            setError('No hemos podido enviar su solicitud. Inténtelo de nuevo o escriba a info@azimutproperty.com.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (submitted) {
        return (
            <div className="inquiry-success" role="status">
                <CheckCircle size={40} strokeWidth={1.25} aria-hidden="true" />
                <h3>Solicitud recibida</h3>
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
                <h3>Solicitar dossier privado</h3>
                <p>Reciba información detallada y confidencial sobre este inmueble.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="inq-name">Nombre completo</label>
                    <input
                        id="inq-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="minimal-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="inq-email">Correo electrónico</label>
                    <input
                        id="inq-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="minimal-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="inq-phone">Teléfono <span className="label-optional">opcional</span></label>
                    <input
                        id="inq-phone"
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="minimal-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="inq-budget">Rango de inversión</label>
                    <select
                        id="inq-budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="minimal-input"
                        required
                    >
                        <option value="" disabled>Seleccione un rango</option>
                        <option value="< 500k">Menos de €500k</option>
                        <option value="500k - 1M">€500k – €1M</option>
                        <option value="1M - 3M">€1M – €3M</option>
                        <option value="> 3M">Más de €3M</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="inq-message">Mensaje <span className="label-optional">opcional</span></label>
                    <textarea
                        id="inq-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="minimal-input"
                        rows="3"
                    ></textarea>
                </div>

                <button type="submit" className="btn-gold-full" disabled={loading}>
                    {loading ? 'Enviando…' : 'Solicitar dossier'}
                </button>

                {error && <p className="form-error" role="alert">{error}</p>}

                <div className="form-trust-indicators">
                    <p>Tratado con estricta confidencialidad.</p>
                    <p>Únase a la creciente comunidad de inversores que reciben nuestros dossiers privados.</p>
                </div>
            </form>
        </div>
    );
};

export default PropertyInquiryForm;
