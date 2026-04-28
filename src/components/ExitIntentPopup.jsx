import React, { useState, useEffect } from 'react';
import { X, BookOpen, Send, CheckCircle } from 'lucide-react';
import { useLeads } from '../context/LeadsContext';

const ExitIntentPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenShown, setHasBeenShown] = useState(false);
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const { addLead } = useLeads();

    useEffect(() => {
        const handleMouseOut = (e) => {
            if (e.clientY <= 0 && !hasBeenShown) {
                setIsVisible(true);
                setHasBeenShown(true);
            }
        };

        document.addEventListener('mouseout', handleMouseOut);
        return () => document.removeEventListener('mouseout', handleMouseOut);
    }, [hasBeenShown]);

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addLead({
                name: 'Lead Magnet Subscriber',
                email: email,
                interest: 'Andalusia Investment Guide 2026',
                message: 'Requested the Investment Guide via Exit Intent Popup.',
                source: 'Exit Intent'
            });
            setSubmitted(true);
            setTimeout(() => {
                setIsVisible(false);
            }, 3000);
        } catch (err) {
            console.error('Error subscribing to lead magnet:', err);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="exit-intent-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="exit-intent-modal" style={{
                backgroundColor: '#fff',
                borderRadius: '1rem',
                maxWidth: '500px',
                width: '100%',
                padding: '2.5rem',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                textAlign: 'center'
            }}>
                <button 
                    onClick={handleClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                    <X size={24} />
                </button>

                {!submitted ? (
                    <>
                        <div style={{ backgroundColor: '#fef3c7', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <BookOpen size={32} color="#b45309" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
                            ¿Te vas sin tu Guía de Inversión?
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                            Descarga gratis nuestra **Guía de Inversión Rural 2026** y descubre las zonas con mayor potencial en Andalucía.
                        </p>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input 
                                type="email" 
                                placeholder="Tu mejor email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                            />
                            <button 
                                type="submit"
                                style={{ 
                                    backgroundColor: '#b8860b', 
                                    color: '#fff', 
                                    padding: '0.75rem', 
                                    borderRadius: '0.5rem', 
                                    border: 'none', 
                                    fontWeight: '600', 
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Send size={18} /> Enviar Guía Gratis
                            </button>
                        </form>
                        <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                            * No hacemos spam. Solo enviamos valor inmobiliario.
                        </p>
                    </>
                ) : (
                    <div style={{ padding: '2rem 0' }}>
                        <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                            ¡Enviado con éxito!
                        </h2>
                        <p style={{ color: '#64748b' }}>
                            Revisa tu bandeja de entrada en unos minutos.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExitIntentPopup;
