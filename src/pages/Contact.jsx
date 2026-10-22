import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Clock } from 'lucide-react';
import { useLeads } from '../context/LeadsContext';
import SEO from '../components/SEO';
import '../styles/Contact.css';

const Contact = () => {
    const { addLead } = useLeads();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        interest: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addLead({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                interest: formData.interest,
                message: formData.message,
                source: 'Contact Page'
            });
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', interest: '', message: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            alert('Error sending message: ' + (error.message || 'Unknown error'));
            console.error(error);
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
                title="Contacto | Inmobiliaria de lujo en Marbella | Azimut Property"
                description="Contacte con Azimut Property para comprar o vender inmuebles de lujo en Marbella, Estepona y la Costa del Sol. Equipo multilingüe. Email: info@azimutproperty.com."
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
                                <p>info@azimutproperty.com</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon"><Clock size={24} /></div>
                            <div className="info-content">
                                <h3>Horario de oficina</h3>
                                <p>Monday - Friday: 9:00 AM - 7:00 PM<br />Saturday: By Appointment</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-section">
                        <h3>Envíenos un mensaje</h3>
                        {submitted ? (
                            <div className="contact-success" role="status">
                                Gracias: su mensaje ha sido enviado. Nos pondremos en contacto con usted en breve.
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="contact-name">Nombre completo</label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        name="name"
                                        autoComplete="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-email">Email</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-phone">Teléfono <span className="label-optional">opcional</span></label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        name="phone"
                                        autoComplete="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-interest">Me interesa</label>
                                    <select
                                        id="contact-interest"
                                        name="interest"
                                        value={formData.interest}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione una opción</option>
                                        <option value="buying">Comprar un inmueble</option>
                                        <option value="selling">Vender un inmueble</option>
                                        <option value="other">Consulta general</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-message">¿En qué podemos ayudarle?</label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-contact-submit">Enviar mensaje</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
