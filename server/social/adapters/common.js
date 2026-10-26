/* eslint-env node */
import { LIMITS } from '../limits.js';
import { composeText, utf8Bytes } from '../text.js';

const EXT_TYPES = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', bmp: 'image/bmp', tif: 'image/tiff', tiff: 'image/tiff',
};

export const typeFromUrl = (url) => {
    const ext = String(url || '').split('?')[0].split('.').pop().toLowerCase();
    return EXT_TYPES[ext] || 'unknown';
};

/**
 * Checks shared by every adapter. Returns a list of human-readable errors in
 * Spanish (they are shown as-is in the admin panel); [] means publishable.
 */
export const validateCommon = (network, draft) => {
    const limits = LIMITS[network];
    const errors = [];
    const hashtags = draft.hashtags || [];
    const images = draft.media || [];

    if (network === 'youtube') {
        if (!String(draft.title || '').trim()) errors.push('Falta el título del vídeo.');
        if (String(draft.title || '').length > limits.maxTitleChars) errors.push(`El título supera ${limits.maxTitleChars} caracteres.`);
        if (/[<>]/.test(`${draft.title}${draft.body}`)) errors.push('YouTube no admite los caracteres < ni >.');
        if (utf8Bytes(composeText(network, draft)) > limits.maxDescriptionBytes) errors.push(`La descripción supera ${limits.maxDescriptionBytes} bytes.`);
        if (hashtags.join(',').length > limits.maxTagsChars) errors.push(`Las etiquetas superan ${limits.maxTagsChars} caracteres.`);
        if (!draft.video?.video_url) errors.push('Falta el vídeo 16:9.');
        if (!draft.video?.short_url) errors.push('Falta el Short 9:16.');
        return errors;
    }

    if (!String(draft.body || '').trim()) errors.push('El texto está vacío.');
    const length = composeText(network, draft).length;
    if (length > limits.maxChars) errors.push(`El texto tiene ${length} caracteres; el máximo es ${limits.maxChars}.`);
    if (hashtags.length > limits.maxHashtags) errors.push(`Hay ${hashtags.length} hashtags; el máximo es ${limits.maxHashtags}.`);
    if (images.length < limits.minImages) errors.push('No hay fotos.');
    if (images.length > limits.maxImages) errors.push(`Hay ${images.length} fotos; el máximo es ${limits.maxImages}.`);
    const bad = images.filter(img => !limits.imageTypes.includes(typeFromUrl(img.url)));
    if (bad.length) errors.push(`${bad.length} foto(s) en formato no admitido por ${network} (${[...new Set(bad.map(i => typeFromUrl(i.url)))].join(', ')}).`);
    return errors;
};
