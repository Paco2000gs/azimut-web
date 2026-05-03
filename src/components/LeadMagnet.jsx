import React, { useState } from 'react';
import { Mail, ArrowRight, Download, CheckCircle } from 'lucide-react';
import '../styles/LeadMagnet.css';

const LeadMagnet = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            setSubmitted(true);
            // Here you would connect to Mailchimp, SendGrid, etc.
            console.log('Lead captured:', email);
        }
    };

    if (submitted) {
        return (
            <div className="lead-magnet-success">
                <CheckCircle size={48} color="#b8860b" />
                <h3>¡Gracias por tu interés!</h3>
                <p>Hemos enviado la Guía de Inversión 2026 a tu correo electrónico.</p>
            </div>
        );
    }

    return (
        <section className="lead-magnet-section">
            <div className="lead-magnet-glass">
                <div className="lead-magnet-content">
                    <span className="lead-badge">RECURSO EXCLUSIVO</span>
                    <h2>Guía de Inversión en Activos Rurales 2026</h2>
                    <p>
                        Descubre cómo identificar fincas con alta rentabilidad en Cádiz y Sevilla. 
                        Analizamos precios por hectárea, subvenciones de la PAC y potencial turístico.
                    </p>
                    
                    <ul className="lead-features">
                        <li><Download size={16} /> Mapa de precios 2026</li>
                        <li><Download size={16} /> Top 5 zonas emergentes</li>
                        <li><Download size={16} /> Guía fiscal para extranjeros</li>
                    </ul>

                    <form onSubmit={handleSubmit} className="lead-form">
                        <div className="input-group">
                            <Mail className="input-icon" size={20} />
                            <input 
                                type="email" 
                                placeholder="Tu correo corporativo..." 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-lead">
                            DESCARGAR GUÍA <ArrowRight size={18} />
                        </button>
                    </form>
                    <p className="privacy-note">Privacidad garantizada. Sin spam, solo valor.</p>
                </div>
                <div className="lead-magnet-image">
                    {/* Placeholder for a beautiful aerial shot of an Andalusian hacienda */}
                    <div className="image-overlay-gradient"></div>
                </div>
            </div>
        </section>
    );
};

export default LeadMagnet;
