import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import { useLeads } from '../context/LeadsContext';
import '../styles/ExitIntentPopup.css';

const SEEN_KEY = 'azimut:guide-prompt-seen';

const ExitIntentPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const { addLead } = useLeads();
    const dialogRef = useRef(null);
    const closeRef = useRef(null);

    useEffect(() => {
        if (sessionStorage.getItem(SEEN_KEY)) return;
        const handleMouseOut = (e) => {
            if (e.clientY > 0 || e.relatedTarget) return;
            sessionStorage.setItem(SEEN_KEY, '1');
            setIsVisible(true);
        };
        document.addEventListener('mouseout', handleMouseOut);
        return () => document.removeEventListener('mouseout', handleMouseOut);
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        closeRef.current?.focus();
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsVisible(false);
                return;
            }
            if (e.key !== 'Tab') return;
            const focusable = dialogRef.current?.querySelectorAll('button, input, a[href]');
            if (!focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [isVisible]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status === 'sending') return;
        setStatus('sending');
        try {
            await addLead({
                name: 'Investment Guide request',
                email,
                interest: 'Rural Asset Investment Guide 2026',
                message: 'Requested the Investment Guide via exit intent.',
                source: 'Exit intent'
            });
            setStatus('done');
            setTimeout(() => setIsVisible(false), 3500);
        } catch {
            setStatus('error');
        }
    };

    if (!isVisible) return null;

    return (
        <div className="exit-overlay" onMouseDown={(e) => e.target === e.currentTarget && setIsVisible(false)}>
            <div
                className="exit-modal"
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="exit-modal-title"
            >
                <button ref={closeRef} className="exit-close" onClick={() => setIsVisible(false)} aria-label="Close">
                    <X size={20} aria-hidden="true" />
                </button>

                {status === 'done' ? (
                    <div className="exit-done" role="status">
                        <CheckCircle size={36} strokeWidth={1.25} aria-hidden="true" />
                        <h2 id="exit-modal-title">En camino</h2>
                        <p>Revise su bandeja de entrada en los próximos minutos.</p>
                    </div>
                ) : (
                    <>
                        <h2 id="exit-modal-title">Antes de irse: el informe de fincas de 2026</h2>
                        <p className="exit-intro">
                            Hacia dónde se mueve el valor en el interior andaluz: precio por hectárea y
                            municipio, las cinco zonas donde estamos comprando y lo que pagan en impuestos
                            los compradores no residentes.
                        </p>
                        <form onSubmit={handleSubmit} className="exit-form">
                            <label htmlFor="exit-email" className="visual-hidden">Correo electrónico</label>
                            <input
                                id="exit-email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder="Su correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-gold" disabled={status === 'sending'}>
                                <Send size={16} aria-hidden="true" />
                                {status === 'sending' ? 'Enviando…' : 'Envíeme el informe'}
                            </button>
                        </form>
                        {status === 'error' && (
                            <p className="exit-error" role="alert">
                                We could not register your request. Please email info@azimutproperty.com.
                            </p>
                        )}
                        <p className="exit-note">No newsletters. We write when we have something worth reading.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ExitIntentPopup;
