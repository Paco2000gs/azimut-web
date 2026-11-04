import React, { useState, useEffect, useCallback } from 'react';
import { Linkedin, Facebook, Instagram, Youtube, RefreshCw, CheckCircle, XCircle, RotateCcw, ExternalLink, Save, Film, ArrowLeft, X, AlertTriangle, Send, Link2 } from 'lucide-react';
import { socialFetch } from '../../utils/socialApi';
import { composeText, normalizeHashtags, utf8Bytes } from '../../../server/social/text.js';
import { LIMITS } from '../../../server/social/limits.js';
import { validateCommon } from '../../../server/social/adapters/common.js';
import '../../styles/SocialMedia.css';

const NETWORK = {
    linkedin: { label: 'LinkedIn', Icon: Linkedin, provider: 'linkedin' },
    facebook: { label: 'Facebook', Icon: Facebook, provider: 'meta' },
    instagram: { label: 'Instagram', Icon: Instagram, provider: 'meta' },
    youtube: { label: 'YouTube', Icon: Youtube, provider: 'google' },
};

const STATUS = {
    generando: 'Generando',
    pendiente: 'Pendiente de revisión',
    aprobado: 'Aprobado (en espera)',
    publicando: 'Publicando…',
    publicado: 'Publicado',
    error: 'Error',
    rechazado: 'Rechazado',
};

const EDITABLE = ['pendiente', 'aprobado', 'error'];
const PROVIDERS = [
    { id: 'meta', label: 'Facebook + Instagram', networks: ['facebook', 'instagram'] },
    { id: 'linkedin', label: 'LinkedIn', networks: ['linkedin'] },
    { id: 'google', label: 'YouTube', networks: ['youtube'] },
];

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : '—');

/** Live counter: what will actually be sent, against the network's limit. */
const Counter = ({ network, draft }) => {
    const limits = LIMITS[network];
    if (network === 'youtube') {
        const bytes = utf8Bytes(composeText('youtube', draft));
        return (
            <span className={`social-counter ${bytes > limits.maxDescriptionBytes ? 'over' : ''}`}>
                Título {String(draft.title || '').length}/{limits.maxTitleChars} · descripción {bytes}/{limits.maxDescriptionBytes} bytes
            </span>
        );
    }
    const length = composeText(network, draft).length;
    return (
        <span className={`social-counter ${length > limits.maxChars ? 'over' : ''}`}>
            {length}/{limits.maxChars} caracteres · {draft.hashtags.length}/{limits.maxHashtags} hashtags
        </span>
    );
};

const PostCard = ({ post, onChanged }) => {
    const [draft, setDraft] = useState(() => ({
        title: post.title || '', body: post.body || '', hashtags: post.hashtags || [], media: post.media || [],
    }));
    const [hashtagText, setHashtagText] = useState((post.hashtags || []).join(' '));
    const [busy, setBusy] = useState(null);
    const [message, setMessage] = useState(null);
    const { label, Icon } = NETWORK[post.network];
    const editable = EDITABLE.includes(post.status);
    const dirty = draft.title !== (post.title || '') || draft.body !== (post.body || '')
        || draft.hashtags.join(' ') !== (post.hashtags || []).join(' ')
        || draft.media.map(m => m.url).join('|') !== (post.media || []).map(m => m.url).join('|');
    const full = { ...draft, link: post.link, video: post.video, network: post.network };
    const problems = editable ? validateCommon(post.network, full) : [];

    const run = async (action, fn) => {
        setBusy(action);
        setMessage(null);
        try {
            const result = await fn();
            if (result?.waiting) setMessage({ type: 'info', text: result.post?.last_error || 'En espera.' });
            else if (result?.invalid) setMessage({ type: 'error', text: result.invalid.join(' ') });
            else if (result?.published === false) setMessage({ type: 'error', text: result.error });
            else if (result?.published) setMessage({ type: 'ok', text: result.dryRun ? 'Publicado (dry-run): no se ha enviado nada a la red.' : 'Publicado.' });
            await onChanged();
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setBusy(null);
        }
    };

    const save = () => socialFetch(`posts/${post.id}`, { method: 'PATCH', body: draft });
    const approve = () => run('approve', async () => {
        if (dirty) await save();
        return socialFetch(`posts/${post.id}/approve`, { method: 'POST' });
    });

    const moveMedia = (i, dir) => setDraft(d => {
        const media = [...d.media];
        const j = i + dir;
        if (j < 0 || j >= media.length) return d;
        [media[i], media[j]] = [media[j], media[i]];
        return { ...d, media };
    });

    const thumb = post.media?.[0]?.url || post.properties?.image;

    return (
        <article className={`social-card status-${post.status}`}>
            <header className="social-card-head">
                {thumb ? <img src={thumb} alt="" className="social-card-thumb" loading="lazy" /> : <div className="social-card-thumb" />}
                <div className="social-card-titles">
                    <span className="social-network"><Icon size={16} aria-hidden="true" /> {label}</span>
                    <strong>{post.properties?.title || `Propiedad ${post.property_id}`}</strong>
                    <span className="social-meta">{[post.properties?.city, post.properties?.province].filter(Boolean).join(', ')} · creado {formatDate(post.created_at)}</span>
                </div>
                <span className={`social-status status-${post.status}`}>
                    {post.status === 'publicado' && post.dry_run ? 'Publicado (dry-run)' : STATUS[post.status]}
                </span>
            </header>

            <div className="social-media-state">
                Media: <b>{{ pendiente: 'pendiente', generando: 'generando fotos y vídeo…', listo: 'lista', error: 'error' }[post.media_status]}</b>
                {post.attempts > 0 && <> · intentos: {post.attempts}</>}
                {post.approved_by && <> · aprobado por {post.approved_by}</>}
            </div>

            {post.last_error && (
                <p className={`social-note ${post.status === 'error' ? 'error' : 'info'}`}><AlertTriangle size={14} aria-hidden="true" /> {post.last_error}</p>
            )}

            {post.network === 'youtube' && (
                <label className="social-field">Título
                    <input value={draft.title} disabled={!editable} onChange={e => setDraft({ ...draft, title: e.target.value })} />
                </label>
            )}
            <label className="social-field">{post.network === 'youtube' ? 'Descripción' : 'Texto'}
                <textarea rows={post.network === 'facebook' ? 5 : 9} value={draft.body} disabled={!editable}
                    onChange={e => setDraft({ ...draft, body: e.target.value })} />
            </label>
            <label className="social-field">Hashtags (separados por espacios)
                <input value={hashtagText} disabled={!editable}
                    onChange={e => { setHashtagText(e.target.value); setDraft({ ...draft, hashtags: normalizeHashtags(e.target.value.split(/[\s,]+/)) }); }} />
            </label>
            <div className="social-row">
                <Counter network={post.network} draft={full} />
                {post.network !== 'instagram' && <span className="social-link"><Link2 size={13} aria-hidden="true" /> {post.link}</span>}
            </div>

            {post.network === 'youtube' ? (
                <div className="social-videos">
                    {post.video?.video_url ? <a href={post.video.video_url} target="_blank" rel="noopener noreferrer"><Film size={14} /> Vídeo 16:9</a> : <span>Vídeo 16:9 pendiente</span>}
                    {post.video?.short_url ? <a href={post.video.short_url} target="_blank" rel="noopener noreferrer"><Film size={14} /> Short 9:16</a> : <span>Short pendiente</span>}
                </div>
            ) : (
                <ul className="social-thumbs">
                    {draft.media.map((m, i) => (
                        <li key={m.url}>
                            <img src={m.url} alt={m.alt || ''} loading="lazy" />
                            {editable && (
                                <div className="social-thumb-actions">
                                    <button type="button" onClick={() => moveMedia(i, -1)} disabled={i === 0} aria-label="Mover a la izquierda"><ArrowLeft size={12} /></button>
                                    <button type="button" onClick={() => setDraft(d => ({ ...d, media: d.media.filter((_, k) => k !== i) }))} aria-label="Quitar foto"><X size={12} /></button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {problems.length > 0 && (
                <ul className="social-problems">{problems.map(p => <li key={p}>{p}</li>)}</ul>
            )}

            {message && <p className={`social-note ${message.type}`}>{message.text}</p>}

            <footer className="social-actions">
                {editable && dirty && (
                    <button type="button" className="btn-secondary" disabled={!!busy} onClick={() => run('save', save)}>
                        <Save size={14} /> {busy === 'save' ? 'Guardando…' : 'Guardar'}
                    </button>
                )}
                {post.status === 'pendiente' && (
                    <button type="button" className="btn-primary" disabled={!!busy || problems.length > 0} onClick={approve}>
                        <CheckCircle size={14} /> {busy === 'approve' ? 'Publicando…' : 'Aprobar y publicar'}
                    </button>
                )}
                {(post.status === 'aprobado' || post.status === 'error') && (
                    <button type="button" className="btn-primary" disabled={!!busy || problems.length > 0}
                        onClick={() => run('publish', async () => { if (dirty) await save(); return socialFetch(`posts/${post.id}/publish`, { method: 'POST' }); })}>
                        {post.status === 'error' ? <RotateCcw size={14} /> : <Send size={14} />} {busy === 'publish' ? 'Publicando…' : post.status === 'error' ? 'Reintentar' : 'Publicar ahora'}
                    </button>
                )}
                {editable && (
                    <button type="button" className="btn-danger" disabled={!!busy}
                        onClick={() => window.confirm('¿Rechazar este borrador? No se publicará.') && run('reject', () => socialFetch(`posts/${post.id}/reject`, { method: 'POST' }))}>
                        <XCircle size={14} /> Rechazar
                    </button>
                )}
                {editable && post.media_status !== 'generando' && (
                    <button type="button" className="btn-secondary" disabled={!!busy}
                        onClick={() => run('media', () => socialFetch(`properties/${post.property_id}/media`, { method: 'POST' }))}>
                        <RefreshCw size={14} /> Regenerar fotos y vídeo
                    </button>
                )}
                {post.external_url && (
                    <a className="btn-secondary" href={post.external_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Ver publicación</a>
                )}
                {post.external_extra?.short_url && (
                    <a className="btn-secondary" href={post.external_extra.short_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Ver Short</a>
                )}
            </footer>

            {post.payload && (
                <details className="social-payload">
                    <summary>{post.dry_run ? 'Payload que se habría enviado' : 'Payload enviado'}</summary>
                    <pre>{JSON.stringify(post.payload, null, 2)}</pre>
                </details>
            )}
        </article>
    );
};

const SocialMediaPanel = () => {
    const [posts, setPosts] = useState([]);
    const [status, setStatus] = useState(null);
    const [filter, setFilter] = useState({ status: '', network: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [banner] = useState(() => {
        const q = new URLSearchParams(window.location.search);
        if (q.get('oauth_error')) return { type: 'error', text: `No se pudo conectar: ${q.get('oauth_error')}` };
        if (q.get('connected')) return { type: 'ok', text: `Cuenta conectada: ${q.get('connected')}` };
        return null;
    });

    const load = useCallback(async () => {
        try {
            const [list, accounts] = await Promise.all([socialFetch('posts'), socialFetch('accounts')]);
            setPosts(list || []);
            setStatus(accounts);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Poll while something is still moving on the server side.
    const moving = posts.some(p => p.status === 'generando' || p.status === 'publicando' || p.media_status === 'generando');
    useEffect(() => {
        if (!moving) return undefined;
        const t = setInterval(load, 15000);
        return () => clearInterval(t);
    }, [moving, load]);

    const connect = async (provider) => {
        try {
            const { url } = await socialFetch(`oauth/${provider}/start`, { method: 'POST' });
            window.location.assign(url);
        } catch (err) {
            setError(err.message);
        }
    };

    const visible = posts.filter(p => (!filter.status || p.status === filter.status) && (!filter.network || p.network === filter.network));
    const accountFor = (network) => status?.accounts?.find(a => a.network === network);

    return (
        <div className="social-panel">
            {status?.dryRun && (
                <div className="social-dry-run">
                    <strong>Modo dry-run activo.</strong> Aprobar un borrador lo marca como «publicado (dry-run)» y guarda el payload, pero no se envía nada a ninguna red. Se desactiva con <code>SOCIAL_DRY_RUN=false</code> en Vercel.
                </div>
            )}
            {banner && <p className={`social-note ${banner.type}`}>{banner.text}</p>}
            {error && <p className="social-note error">{error}</p>}

            <section className="social-accounts">
                <div className="social-accounts-head">
                    <h3>Cuentas</h3>
                    <span className="social-meta">
                        IA: {status?.ai ? 'Gemini' : 'plantilla (sin GEMINI_API_KEY)'} · Worker de fotos y vídeo: {status?.worker ? 'configurado' : 'no configurado'}
                    </span>
                </div>
                <div className="social-accounts-grid">
                    {PROVIDERS.map(p => (
                        <div key={p.id} className="social-account">
                            <strong>{p.label}</strong>
                            {p.networks.map(n => {
                                const a = accountFor(n);
                                const { Icon } = NETWORK[n];
                                return (
                                    <span key={n} className={`social-account-state ${!a?.connected ? 'off' : a.expired ? 'bad' : a.expires_soon ? 'warn' : 'ok'}`}>
                                        <Icon size={14} aria-hidden="true" />
                                        {!a?.connected ? 'No conectada'
                                            : a.expired ? 'Token caducado'
                                                : `${a.account_name || a.account_id}${a.token_expires_at ? ` · caduca ${formatDate(a.token_expires_at)}` : ''}`}
                                    </span>
                                );
                            })}
                            <button type="button" className="btn-secondary" onClick={() => connect(p.id)}>
                                {p.networks.some(n => accountFor(n)?.connected) ? 'Reconectar' : 'Conectar'}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <div className="filters-section">
                <select className="filter-select" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
                    <option value="">Todos los estados</option>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <select className="filter-select" value={filter.network} onChange={e => setFilter({ ...filter, network: e.target.value })}>
                    <option value="">Todas las redes</option>
                    {Object.entries(NETWORK).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <button type="button" className="btn-secondary" onClick={load}><RefreshCw size={14} /> Actualizar</button>
            </div>

            {loading ? (
                <p className="social-meta">Cargando borradores…</p>
            ) : visible.length === 0 ? (
                <div className="empty-state">
                    <p>No hay borradores. Se crean solos al dar de alta una propiedad nueva.</p>
                </div>
            ) : (
                <div className="social-list">
                    {visible.map(p => <PostCard key={`${p.id}-${p.updated_at}`} post={p} onChanged={load} />)}
                </div>
            )}
        </div>
    );
};

export default SocialMediaPanel;
