import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { useLeads } from '../context/LeadsContext';
import '../styles/LeadMagnet.css';

const LeadMagnet = () => {
    const { addLead } = useLeads();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || status === 'sending') return;
        setStatus('sending');
        try {
            await addLead({
                name: 'Investment Guide request',
                email,
                interest: 'Rural Asset Investment Guide 2026',
                source: 'Lead magnet — home page',
                message: 'Requested the Rural Asset Investment Guide 2026.'
            });
            setStatus('done');
        } catch {
            setStatus('error');
        }
    };

    return (
        <section className="lead-magnet-section" aria-labelledby="lead-magnet-title">
            <div className="lead-magnet-panel">
                <div className="lead-magnet-content">
                    {status === 'done' ? (
                        <div className="lead-magnet-success" role="status">
                            <CheckCircle size={40} strokeWidth={1.25} aria-hidden="true" />
                            <h2 id="lead-magnet-title">La guía está en camino</h2>
                            <p>
                                We have sent the Rural Asset Investment Guide 2026 to {email}. If it
                                does not arrive within a few minutes, check your spam folder or write
                                to info@azimutproperty.com.
                            </p>
                        </div>
                    ) : (
                        <>
                            <h2 id="lead-magnet-title">Guía de inversión en fincas rústicas 2026</h2>
                            <p className="lead-magnet-intro">
                                How to identify high-yield estates in Cádiz and Sevilla: price per
                                hectare, CAP subsidies and tourism potential, analysed by our
                                acquisition team.
                            </p>

                            <ul className="lead-features">
                                <li>Mapa de precios de 2026</li>
                                <li>Cinco zonas emergentes</li>
                                <li>Guía fiscal para compradores no residentes</li>
                            </ul>

                            <form onSubmit={handleSubmit} className="lead-form" noValidate={false}>
                                <div className="input-group">
                                    <label htmlFor="lead-email" className="visual-hidden">Correo electrónico</label>
                                    <Mail className="input-icon" size={18} aria-hidden="true" />
                                    <input
                                        id="lead-email"
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder="Su correo electrónico"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-gold btn-lead" disabled={status === 'sending'}>
                                    {status === 'sending' ? 'Enviando…' : 'Solicitar la guía'}
                                    <ArrowRight size={16} aria-hidden="true" />
                                </button>
                            </form>

                            {status === 'error' && (
                                <p className="lead-error" role="alert">
                                    No hemos podido registrar su solicitud. Inténtelo de nuevo o escriba
                                    directamente a info@azimutproperty.com.
                                </p>
                            )}

                            <p className="privacy-note">
                                Sus datos quedan con nosotros. Sin boletines ni terceros.
                            </p>
                        </>
                    )}
                </div>

                <div className="lead-magnet-media">
                    <picture>
                        <source
                            type="image/webp"
                            srcSet="/media/guide-terraces-600.webp 600w, /media/guide-terraces-900.webp 900w"
                            sizes="(max-width: 900px) 100vw, 40vw"
                        />
                        <img
                            src="/media/guide-terraces-900.webp"
                            alt="Olivares en terrazas en una finca de ladera andaluza"
                            loading="lazy"
                            decoding="async"
                            width="900"
                            height="2599"
                        />
                    </picture>
                </div>
            </div>
        </section>
    );
};

export default LeadMagnet;
