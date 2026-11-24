import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, X, CheckCircle } from 'lucide-react';
import { useProperties } from '../context/PropertiesContext';
import { useLeads } from '../context/LeadsContext';
import { CONTACT_EMAIL, CONTACT_OPEN_EVENT, contactMailto } from '../constants/contact';
import { extractIdFromSlug, generatePropertyPath } from '../utils/slugify';
import { trackFormSubmit } from '../utils/analytics';
import '../styles/ContactCTA.css';

// The canonical host, never window.location.origin: the prerender runs on
// localhost and would bake that address into every subject line it captures.
const SITE_URL = 'https://www.azimutproperty.com';
// Listing pages, plus the printable dossier, which is about one listing too.
const PROPERTY_PATH = /^\/(property|properties|dossier)\/([^/]+)\/?$/;

const priceLabel = (property) => (property.price_on_demand || !property.price
    ? 'Precio a consultar'
    : `€${property.price.toLocaleString()}`);

// Subject and body for the mailto fallback. On a listing the subject carries the
// title, the reference and the URL, so the email identifies the property even
// when the visitor writes nothing else.
const mailFor = (property, pathname) => {
    if (!property) {
        return { subject: `Solicitud de información — ${SITE_URL}${pathname}` };
    }
    const title = property.title.trim();
    const url = `${SITE_URL}${generatePropertyPath(property)}`;
    return {
        subject: `Solicitud de dossier: ${title} (Ref. ${property.id}) — ${url}`,
        body: `Buenos días:\n\nMe gustaría recibir el dossier de «${title}» (Ref. ${property.id}).\n${url}\n\n`,
    };
};

const ContactForm = ({ property, heading, pathname, mail, onDone }) => {
    const { addLead } = useLeads();
    const title = property?.title.trim();
    const [form, setForm] = useState({
        name: '',
        email: '',
        message: property ? `Me gustaría recibir el dossier de «${title}» (Ref. ${property.id}).` : '',
    });
    const [status, setStatus] = useState('idle');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (status === 'sending') return;
        setStatus('sending');
        try {
            await addLead({
                name: form.name.trim(),
                email: form.email.trim(),
                message: form.message.trim(),
                interest: property ? `Dossier: ${title} (Ref. ${property.id})` : 'Solicitud de información',
                source: `Botón de contacto — ${pathname}`,
                ...(property && { property_title: title }),
            });
            trackFormSubmit('contact_dialog', property?.id);
            setStatus('done');
        } catch {
            setStatus('error');
        }
    };

    if (status === 'done') {
        return (
            <div className="contact-dialog-done" role="status">
                <CheckCircle size={36} strokeWidth={1.25} aria-hidden="true" />
                <h2 id="contact-dialog-title">Solicitud enviada</h2>
                <p>Le responderemos por email a <strong>{form.email}</strong> desde {CONTACT_EMAIL}.</p>
                <button type="button" className="contact-dialog-submit" onClick={onDone}>Cerrar</button>
            </div>
        );
    }

    return (
        <>
            <h2 id="contact-dialog-title">{heading}</h2>
            <p className="contact-dialog-intro">
                {property
                    ? <>{title} <span className="contact-dialog-ref">Ref. {property.id}</span></>
                    : 'Cuéntenos qué busca y le responderemos por email.'}
            </p>

            <form className="contact-dialog-form" onSubmit={handleSubmit}>
                <div className="contact-dialog-field">
                    <label htmlFor="cta-name">Nombre</label>
                    <input
                        id="cta-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="contact-dialog-field">
                    <label htmlFor="cta-email">Email</label>
                    <input
                        id="cta-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="contact-dialog-field">
                    <label htmlFor="cta-message">Mensaje</label>
                    <textarea
                        id="cta-message"
                        name="message"
                        rows="3"
                        value={form.message}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="contact-dialog-submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Enviando…' : 'Enviar solicitud'}
                </button>

                {status === 'error' && (
                    <p className="contact-dialog-error" role="alert">
                        No hemos podido enviar su solicitud. Vuelva a intentarlo o escríbanos
                        directamente a <a href={contactMailto(mail)}>{CONTACT_EMAIL}</a>.
                    </p>
                )}
            </form>

            <p className="contact-dialog-alt">
                ¿Prefiere su propio correo? Escríbanos a{' '}
                <a href={contactMailto(mail)}>{CONTACT_EMAIL}</a>
            </p>
            <p className="contact-dialog-legal">
                Al enviar acepta nuestra <Link to="/privacy">política de privacidad</Link>.
            </p>
        </>
    );
};

/**
 * Email contact on every public page: a fixed bar along the bottom on phones and
 * a floating button on desktop. Both open a short form that files a lead; the
 * form also offers a prefilled mailto for visitors who prefer their own client.
 * On a listing the button reads "Solicitar dossier" and the form arrives filled
 * in with that property.
 */
const ContactCTA = () => {
    const { pathname } = useLocation();
    const { getPropertyById } = useProperties();
    const dialogRef = useRef(null);
    const ctaRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [hidden, setHidden] = useState(false);

    const match = pathname.match(PROPERTY_PATH);
    const property = match ? getPropertyById(extractIdFromSlug(match[2])) || null : null;
    const mail = mailFor(property, pathname);
    // A visitor already reading the dossier is asking about it, not for it.
    const label = property && match[1] !== 'dossier' ? 'Solicitar dossier' : 'Solicitar información';

    // Steps aside whenever its own box would sit over the footer (which carries
    // the address) or over a page's own enquiry form, both marked
    // [data-contact-cta-hide]: the button floats over the page, but never over
    // the fields the visitor came to fill in nor over the page's last lines.
    // The slot is measured from offset sizes and computed offsets, which ignore
    // the slide-away transform, so hiding cannot feed back into the measurement.
    useEffect(() => {
        const cta = ctaRef.current;
        if (!cta) return undefined;
        let frame = 0;
        const check = () => {
            frame = 0;
            const style = getComputedStyle(cta);
            const right = window.innerWidth - (parseFloat(style.right) || 0);
            const bottom = window.innerHeight - (parseFloat(style.bottom) || 0);
            const left = right - cta.offsetWidth;
            const top = bottom - cta.offsetHeight;
            const covers = [...document.querySelectorAll('[data-contact-cta-hide]')].some((el) => {
                const box = el.getBoundingClientRect();
                return box.left < right && box.right > left && box.top < bottom && box.bottom > top;
            });
            setHidden(covers);
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(check);
        };
        schedule();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        // Images and lazy sections move the targets without any scroll.
        const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
        resize?.observe(document.body);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            resize?.disconnect();
        };
    }, [pathname, property]);

    // Other buttons on the page (the listing's own "Solicitar dossier") open
    // this same dialog instead of keeping a second form.
    useEffect(() => {
        const open = () => setIsOpen(true);
        window.addEventListener(CONTACT_OPEN_EVENT, open);
        return () => window.removeEventListener(CONTACT_OPEN_EVENT, open);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen && !dialog.open) {
            dialog.showModal();
            document.body.style.overflow = 'hidden';
            // showModal() focuses the first control, which is the close button;
            // the visitor came to write, so start them on the first field.
            dialog.querySelector('input')?.focus();
        }
    }, [isOpen]);

    // Following a link out of the dialog (the privacy policy) must not leave it
    // open over the next page. close() fires the close event, which resets state.
    useEffect(() => {
        if (dialogRef.current?.open) dialogRef.current.close();
    }, [pathname]);

    const close = () => dialogRef.current?.close();

    // The browser hands focus back to the button that opened the dialog.
    const handleClose = () => {
        document.body.style.overflow = '';
        setIsOpen(false);
    };

    return (
        <>
            <div className="contact-cta" ref={ctaRef} data-hidden={hidden ? 'true' : 'false'}>
                {property && (
                    <div className="contact-cta-summary">
                        <span className="contact-cta-place">{property.city}</span>
                        <strong>{priceLabel(property)}</strong>
                    </div>
                )}
                <button
                    type="button"
                    className="contact-cta-button"
                    onClick={() => setIsOpen(true)}
                    aria-haspopup="dialog"
                    aria-label={property ? `${label} de ${property.title.trim()} por email` : `${label} por email`}
                >
                    <Mail size={18} strokeWidth={1.5} aria-hidden="true" />
                    <span>{label}</span>
                </button>
            </div>

            <dialog
                ref={dialogRef}
                className="contact-dialog"
                aria-labelledby="contact-dialog-title"
                onClose={handleClose}
                // Only the backdrop hits the dialog element itself; the panel
                // inside fills it, so clicks on the form never land here.
                onClick={(e) => { if (e.target === e.currentTarget) close(); }}
            >
                <div className="contact-dialog-panel" data-form-name="contact_dialog">
                    <button type="button" className="contact-dialog-close" onClick={close} aria-label="Cerrar formulario de contacto">
                        <X size={20} aria-hidden="true" />
                    </button>
                    {isOpen && (
                        <ContactForm property={property} heading={label} pathname={pathname} mail={mail} onDone={close} />
                    )}
                </div>
            </dialog>
        </>
    );
};

export default ContactCTA;
