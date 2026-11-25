import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Clock } from 'lucide-react';
import { useLeads } from '../context/LeadsContext';
import { CONTACT_EMAIL, contactMailto } from '../constants/contact';
import { trackFormSubmit } from '../utils/analytics';
import { explainInvalid, clearInvalid } from '../utils/formValidity';
import SEO from '../components/SEO';
import '../styles/Contact.css';

const INTERESTS = ['Comprar una finca o propiedad', 'Vender una propiedad', 'Otra consulta'];

const Contact = () => {
    const { addLead } = useLeads();
    // Name, email and interest only (with a sensible default): the form had
    // five fields, a required message among them, and GA4 counted 24 form
    // starts with no submission (23 Aug - 20 Nov 2026).
    const [formData, setFormData] = useState({ name: '', email: '', interest: INTERESTS[0] });
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);
        setError('');
        try {
            await addLead({
                name: formData.name.trim(),
                email: formData.email.trim(),
                interest: formData.interest,
                message: formData.interest,
                source: 'Contact Page'
            });
            trackFormSubmit('contact_page');
            // The confirmation stays until the visitor leaves: it used to vanish
            // after five seconds, before a slow reader had seen it.
            setSubmittedEmail(formData.email.trim());
            setFormData({ name: '', email: '', interest: INTERESTS[0] });
        } catch (err) {
            console.error(err);
            setError('No hemos podido enviar su mensaje. Inténtelo de nuevo o escríbanos directamente a');
        } finally {
            setSending(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Contacto", "item": "https://www.azimutproperty.com/contact" }
        ]
    };

    return (
        <div className="page contact">
            <SEO
                title="Contacto: fincas y villas de lujo | Azimut Property"
                description={`Escriba a ${CONTACT_EMAIL} para comprar o vender fincas, cortijos y villas de lujo en Andalucía. Respuesta por email y equipo multilingüe.`}
                url="/contact"
                lang="es"
                keywords="contacto inmobiliaria Marbella, consulta inmueble de lujo Costa del Sol, comprar villa Marbella contacto"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>
            <div className="container">
                <div className="section-header">
                    <h1>Contacto</h1>
                    <p>Estamos aquí para ayudarle con sus necesidades inmobiliarias.</p>
                </div>

                <div className="contact-container">
                    <div className="contact-info-section">
                        <h2>Póngase en contacto</h2>
                        <p>Tanto si quiere comprar o vender como si tiene una pregunta sobre el mercado, nuestro equipo está preparado para ayudarle. Nos distinguimos por la rapidez de respuesta y la discreción.</p>

                        <div className="info-card">
                            <div className="info-icon"><Mail size={24} /></div>
                            <div className="info-content">
                                <h3>Escríbanos</h3>
                                <p><a href={contactMailto({ subject: 'Consulta desde la web' })}>{CONTACT_EMAIL}</a></p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon"><Clock size={24} /></div>
                            <div className="info-content">
                                <h3>Horario de oficina</h3>
                                <p>Lunes a viernes: 9:00 – 19:00<br />Sábados: con cita previa</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-section" data-contact-cta-hide="form">
                        <h3>Envíenos un mensaje</h3>
                        {submittedEmail ? (
                            <div className="contact-success" role="status">
                                Gracias: hemos recibido su mensaje. Le responderemos por email a{' '}
                                <strong>{submittedEmail}</strong> desde {CONTACT_EMAIL}.
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="contact-name">Nombre</label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        name="name"
                                        autoComplete="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onInvalid={explainInvalid}
                                        onInput={clearInvalid}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-email">Email</label>
                                    <input
                                        id="contact-email"
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
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-interest">Me interesa</label>
                                    <select
                                        id="contact-interest"
                                        name="interest"
                                        value={formData.interest}
                                        onChange={handleChange}
                                        required
                                    >
                                        {INTERESTS.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-contact-submit" disabled={sending}>
                                    {sending ? 'Enviando…' : 'Enviar mensaje'}
                                </button>
                                {error && (
                                    <p className="contact-error" role="alert">
                                        {error} <a href={contactMailto({ subject: 'Consulta desde la web' })}>{CONTACT_EMAIL}</a>.
                                    </p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
