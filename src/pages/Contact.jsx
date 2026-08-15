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
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.azimutproperty.com/" },
            { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://www.azimutproperty.com/contact" }
        ]
    };

    return (
        <div className="page contact">
            <SEO
                title="Contact Us | Luxury Real Estate Agency Marbella"
                description="Contact Azimut Property to buy or sell luxury real estate in Marbella, Estepona, and Costa del Sol. Multilingual team. Email: info@azimutproperty.com."
                url="/contact"
                keywords="contact real estate Marbella, luxury property inquiry Costa del Sol, buy villa Marbella contact"
            />
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>
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
                            <div className="contact-success" role="status">
                                Thank you — your message has been sent. We will be in touch shortly.
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="contact-name">Full name</label>
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
                                    <label htmlFor="contact-phone">Phone <span className="label-optional">optional</span></label>
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
                                    <label htmlFor="contact-interest">I am interested in</label>
                                    <select
                                        id="contact-interest"
                                        name="interest"
                                        value={formData.interest}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select an option</option>
                                        <option value="buying">Buying a property</option>
                                        <option value="selling">Selling a property</option>
                                        <option value="other">General enquiry</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-message">How can we help?</label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-contact-submit">Send message</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
