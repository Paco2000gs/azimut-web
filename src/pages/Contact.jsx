import React, { useState } from 'react';
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

    return (
        <div className="page contact">
            <SEO
                title="Contacto"
                description="Póngase en contacto con Azimut Property. Estamos aquí para asistirle en la compra o venta de inmuebles de lujo en Andalucía."
                url="/contact"
            />
            <div className="container">
                <div className="section-header">
                    <h1>Contact Us</h1>
                    <p>We are here to assist you with your real estate needs.</p>
                </div>

                <div className="contact-container">
                    <div className="contact-info-section">
                        <h2>Get in Touch</h2>
                        <p>Whether you are looking to buy, sell, or simply have a question about the market, our team is ready to help. We pride ourselves on our responsiveness and discretion.</p>

                        <div className="info-card">
                            <div className="info-icon"><Mail size={24} /></div>
                            <div className="info-content">
                                <h3>Email Us</h3>
                                <p>info@azimutproperty.com</p>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-icon"><Clock size={24} /></div>
                            <div className="info-content">
                                <h3>Office Hours</h3>
                                <p>Monday - Friday: 9:00 AM - 7:00 PM<br />Saturday: By Appointment</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-section">
                        <h3>Send us a Message</h3>
                        {submitted ? (
                            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                                Thank you! Your message has been sent. We will contact you shortly.
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <select
                                        name="interest"
                                        value={formData.interest}
                                        onChange={handleChange}
                                    >
                                        <option value="">I am interested in...</option>
                                        <option value="buying">Buying a Property</option>
                                        <option value="selling">Selling a Property</option>
                                        <option value="other">General Inquiry</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <textarea
                                        name="message"
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn" style={{ width: '100%' }}>Send Message</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
