/* eslint-env node */
import { LIMITS } from './limits.js';

/** "#Lujo Marbella", "lujo" -> "LujoMarbella", "lujo"; deduped case-insensitively. */
export const normalizeHashtags = (tags = []) => {
    const seen = new Set();
    const out = [];
    for (const raw of tags) {
        const tag = String(raw || '')
            .replace(/^[#＃]+/, '')
            .split(/\s+/)
            .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
            .join('')
            .replace(/[^\p{L}\p{N}_]/gu, '');
        const key = tag.toLowerCase();
        if (tag && !seen.has(key)) {
            seen.add(key);
            out.push(tag);
        }
    }
    return out;
};

export const hashtagLine = (tags) => tags.map(t => `#${t}`).join(' ');

// TextEncoder rather than Buffer: the admin panel imports this module too.
export const utf8Bytes = (s) => new TextEncoder().encode(String(s || '')).length;

/** Cut at the last whole word that fits, adding an ellipsis. */
export const truncate = (text, max) => {
    const s = String(text || '').trim();
    if (s.length <= max) return s;
    const cut = s.slice(0, Math.max(0, max - 1));
    const space = cut.lastIndexOf(' ');
    return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
};

const truncateBytes = (text, maxBytes) => {
    let s = String(text || '');
    while (utf8Bytes(s) > maxBytes) s = truncate(s, Math.floor(s.length * 0.95));
    return s;
};

/** YouTube rejects < and > anywhere in title and description. */
const stripAngles = (s) => String(s || '').replace(/[<>]/g, '');

/**
 * LinkedIn `little` text: every reserved character must be backslash-escaped,
 * even outside an element. Hashtags then go in as HashtagTemplate.
 * https://learn.microsoft.com/linkedin/marketing/community-management/shares/little-text-format
 */
export const escapeLittle = (text) => String(text || '').replace(/[\\|{}@[\]()<>#*_~]/g, (c) => `\\${c}`);

/**
 * The exact text each network receives, built from the editable draft fields.
 * Kept in one place so the panel's character counter, validation and the
 * adapters can never disagree about what is being sent.
 */
export const composeText = (network, { body = '', link = '', hashtags = [] }) => {
    const tags = hashtagLine(hashtags);
    switch (network) {
        case 'linkedin':
        case 'facebook':
            return [body.trim(), link, tags].filter(Boolean).join('\n\n');
        case 'instagram':
            // Links in captions aren't clickable on Instagram; the body points
            // to the bio instead, so the URL would only be noise here.
            return [body.trim(), tags].filter(Boolean).join('\n\n');
        case 'youtube':
            return [link, body.trim(), tags].filter(Boolean).join('\n\n');
        default:
            throw new Error(`Unknown network ${network}`);
    }
};

/** LinkedIn commentary in `little` format, hashtags as templates. */
export const composeLinkedInCommentary = ({ body = '', link = '', hashtags = [] }) => [
    escapeLittle(body.trim()),
    escapeLittle(link),
    hashtags.map(t => `{hashtag|\\#|${escapeLittle(t)}}`).join(' '),
].filter(Boolean).join('\n\n');

/**
 * Bring a generated (or edited) draft inside the network's limits: hashtags
 * normalised and capped, body shortened until the composed text fits.
 */
export const clampDraft = (network, draft) => {
    const limits = LIMITS[network];
    const hashtags = normalizeHashtags(draft.hashtags).slice(0, limits.maxHashtags);
    let body = String(draft.body || '').trim();
    let title = draft.title;

    if (network === 'youtube') {
        title = truncate(stripAngles(title), limits.maxTitleChars);
        body = stripAngles(body);
        const tagsLen = hashtags.join(',').length;
        const tagsFit = tagsLen <= limits.maxTagsChars ? hashtags : hashtags.slice(0, 3);
        const overhead = utf8Bytes(composeText('youtube', { body: '', link: draft.link, hashtags: tagsFit }));
        body = truncateBytes(body, limits.maxDescriptionBytes - overhead - 4);
        return { ...draft, title, body, hashtags: tagsFit };
    }

    const room = limits.maxChars - composeText(network, { body: '', link: draft.link, hashtags }).length - 2;
    body = truncate(body, Math.max(0, room));
    return { ...draft, body, hashtags };
};
