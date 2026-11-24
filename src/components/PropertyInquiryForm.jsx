import React, { useState } from 'react';
import { useLeads } from '../context/LeadsContext';
import { CONTACT_EMAIL } from '../constants/contact';
import { trackFormSubmit } from '../utils/analytics';
import { explainInvalid, clearInvalid } from '../utils/formValidity';
import '../styles/PropertyInquiryForm.css';
import { CheckCircle } from 'lucide-react';

// Three fields only: name, email and interest, with the most common interest
// already chosen. The form had five, budget among the required ones, and GA4
// counted 24 form starts with no submission (23 Aug - 20 Nov 2026).
const INTERESTS = ['Recibir el dossier privado', 'Concertar una visita', 'Otra consulta sobre el inmueble'];

const PropertyInquiryForm = ({ propertyId, propertyTitle }) => {
    const { addLead } = useLeads();
    const [formData, setFormData] = useState({ name: '', email: '', interest: INTERESTS[0] });
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError('');

        try {
            await addLead({
                name: formData.name.trim(),
                email: formData.email.trim(),
                interest: `${formData.interest}: ${propertyTitle}`,
                message: formData.interest,
                source: 'Property Detail',
                property_title: propertyTitle
            });
            trackFormSubmit('property_inquiry', propertyId);
            setSubmittedEmail(formData.email.trim());
            setFormData({ name: '', email: '', interest: INTERESTS[0] });
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(`No hemos podido enviar su solicitud. Inténtelo de nuevo o escriba a ${CONTACT_EMAIL}.`);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (submittedEmail) {
        return (
            <div className="inquiry-success" role="status" data-contact-cta-hide="form">
                <CheckCircle size={40} strokeWidth={1.25} aria-hidden="true" />
                <h3>Solicitud recibida</h3>
                <p>Le responderemos por email a <strong>{submittedEmail}</strong> desde {CONTACT_EMAIL}.</p>
                <button onClick={() => setSubmittedEmail('')} className="btn-text">
                    Enviar otra consulta
                </button>
            </div>
        );
    }

    return (
        <div className="property-inquiry-form" data-contact-cta-hide="form">
            <div className="form-header">
                <h3>Solicitar dossier privado</h3>
                <p>Reciba información detallada y confidencial sobre este inmueble.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="inq-name">Nombre</label>
                    <input
                        id="inq-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        onInvalid={explainInvalid}
                        onInput={clearInvalid}
                        required
                        className="minimal-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="inq-email">Email</label>
                    <input
                        id="inq-email"
                        type="email"
                        name="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={formData.email}
                        onChange={handleChange}
                        onInvalid={explainInvalid}
                        onInput={clearInvalid}
                        required
                        className="minimal-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="inq-interest">Me interesa</label>
                    <select
                        id="inq-interest"
                        name="interest"
                        value={formData.interest}
                        onChange={handleChange}
                        className="minimal-input"
                        required
                    >
                        {INTERESTS.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn-gold-full" disabled={loading}>
                    {loading ? 'Enviando…' : 'Solicitar dossier'}
                </button>

                {error && <p className="form-error" role="alert">{error}</p>}

                <div className="form-trust-indicators">
                    <p>Tratado con estricta confidencialidad.</p>
                </div>
            </form>
        </div>
    );
};

export default PropertyInquiryForm;
