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
            setError('We could not send your request. Please try again, or write to info@azimutproperty.com.');
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
                <h3>Request received</h3>
                <p>We will send the private dossier to your email shortly.</p>
                <button onClick={() => setSubmitted(false)} className="btn-text">
                    Send another inquiry
                </button>
            </div>
        );
    }

    return (
        <div className="property-inquiry-form">
            <div className="form-header">
                <h3>Request Private Dossier</h3>
                <p>Receive detailed and confidential information about this property.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="inq-name">Full name</label>
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
                    <label htmlFor="inq-email">Email</label>
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
                    <label htmlFor="inq-phone">Phone <span className="label-optional">optional</span></label>
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
                    <label htmlFor="inq-budget">Investment range</label>
                    <select
                        id="inq-budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="minimal-input"
                        required
                    >
                        <option value="" disabled>Select a range</option>
                        <option value="< 500k">Below €500k</option>
                        <option value="500k - 1M">€500k – €1M</option>
                        <option value="1M - 3M">€1M – €3M</option>
                        <option value="> 3M">Above €3M</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="inq-message">Message <span className="label-optional">optional</span></label>
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
                    {loading ? 'Sending…' : 'Request Dossier'}
                </button>

                {error && <p className="form-error" role="alert">{error}</p>}

                <div className="form-trust-indicators">
                    <p>Treated with strict confidentiality.</p>
                    <p>Join a growing community of investors receiving our private dossiers.</p>
                </div>
            </form>
        </div>
    );
};

export default PropertyInquiryForm;
