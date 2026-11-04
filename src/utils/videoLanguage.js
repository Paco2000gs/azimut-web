const VIDEO_LANGUAGE_LABELS = { es: 'Español', en: 'English' };

/**
 * Listing videos are uploaded once per language, and the file name is the only
 * record of which is which: "5_en-web.mp4", "DE0130-hacienda-es.mp4",
 * "DE0768-polo-EN-azimut.mp4". The marker has to end the name or come right
 * before "web"/"azimut", so "finca-en-ronda.mp4" is not read as English.
 */
export const getVideoLanguage = (title) => {
    const match = /[_-](en|es)(?:[_-](?:web|azimut)[^.]*)?\.[a-z0-9]+$/i.exec((title || '').trim());
    return match ? match[1].toLowerCase() : null;
};

export const getVideoLanguageLabel = (title) => VIDEO_LANGUAGE_LABELS[getVideoLanguage(title)] || '';

/** The site is in Spanish, so the Spanish cut plays first. Otherwise upload order holds. */
export const spanishVideosFirst = (videos) => [...videos].sort(
    (a, b) => (getVideoLanguage(b.title) === 'es') - (getVideoLanguage(a.title) === 'es')
);
