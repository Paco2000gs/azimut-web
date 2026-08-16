/**
 * Guess whether a piece of editorial copy is Spanish or English.
 *
 * The posts table has no language column and the Journal is genuinely mixed:
 * some articles are written for the Spanish market, some for the international
 * buyer. Declaring every article `es` mispronounces the English ones for screen
 * reader users; declaring them all `en` does the same in reverse.
 *
 * Function words are counted on BOTH sides on purpose. Counting only Spanish
 * markers misreads English headlines that carry Spanish place names — "Why
 * investors are buying in Jimena de la Frontera" hits `de` and `la` while being
 * entirely English. Scoring the English markers too settles those correctly.
 *
 * Ties resolve to Spanish: that is the site's current declared language, so an
 * undecidable case changes nothing.
 */

const SPANISH_WORDS = /\b(de|del|la|las|el|los|en|para|por|qué|que|cómo|como|una|uno|un|con|se|más|y|su|guía|venta|casa|finca|dónde)\b/g;
const ENGLISH_WORDS = /\b(the|of|in|for|why|how|a|an|and|with|to|is|are|on|from|guide|where|your|our)\b/g;
const SPANISH_CHARS = /[áéíóúñ¿¡]/g;

const countMatches = (text, pattern) => (text.match(pattern) || []).length;

export const detectLang = (text) => {
    if (!text) return 'es';

    const normalized = String(text).toLowerCase();
    // Accented characters and inverted punctuation are strong evidence: English
    // copy about Spain rarely carries them outside proper nouns.
    const spanish = countMatches(normalized, SPANISH_WORDS) + countMatches(normalized, SPANISH_CHARS) * 2;
    const english = countMatches(normalized, ENGLISH_WORDS);

    return english > spanish ? 'en' : 'es';
};

export default detectLang;
