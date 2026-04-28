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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

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
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error sending inquiry. Please try again.');
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
                <h3>Request Received!</h3>
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
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
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
                        placeholder="Preferred Email"
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
                        placeholder="Phone (Optional)"
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
                        <option value="" disabled>Investment Range</option>
                        <option value="< 500k">Below €500k</option>
                        <option value="500k - 1M">€500k - €1M</option>
                        <option value="1M - 3M">€1M - €3M</option>
                        <option value="> 3M">Above €3M</option>
                    </select>
                </div>

                <div className="form-group">
                    <textarea
                        name="message"
                        placeholder="Short message (optional)"
                        value={formData.message}
                        onChange={handleChange}
                        className="minimal-input"
                        rows="2"
                    ></textarea>
                </div>

                <button type="submit" className="btn-gold-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Request Dossier'}
                </button>

                <div className="form-trust-indicators" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                    <p style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <CheckCircle size={12} color="#10b981" /> Data treated with strict confidentiality
                    </p>
                    <p style={{ margin: '0.25rem 0' }}>Join 500+ investors receiving our private dossiers.</p>
                </div>
            </form>
        </div>
    );
};

export default PropertyInquiryForm;
