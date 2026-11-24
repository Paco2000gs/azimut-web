// Spanish <title> and meta description for a listing, built only from its
// Supabase fields: type, the listing's own title, city, province, surfaces,
// bedrooms and price. Nothing here is written back to Supabase.
//
// Listing pages used to ship the raw title plus "— Finca en ..." (92-126
// characters, mostly English) and a 320-character description that opened with
// the English text: CTR 0.8 % at position 8.5 for /property/finca-casabermeja-25
// (Search Console, Aug-Nov 2026).

const TITLE_MAX = 60;
const META_MAX = 155;

// What kind of property it is, read from words in the listing's own title
// (Spanish or English). When several match, the earliest in the title wins:
// "Finca Rústica ... con Cortijo Histórico" is a finca, not a cortijo.
const KINDS = [
    { re: /finca r[uú]stica/i, label: 'Finca Rústica' },
    { re: /hacienda/i, label: 'Hacienda' },
    { re: /cortijo/i, label: 'Cortijo' },
    { re: /dehesa/i, label: 'Dehesa' },
    { re: /viñedo|vineyard|bodega|winery/i, label: 'Viñedo' },
    { re: /palacete/i, label: 'Palacete' },
    { re: /palace|palacio/i, label: 'Palacio' },
    { re: /hotel/i, label: 'Hotel Rural' },
    { re: /casa de campo|country house/i, label: 'Casa de Campo' },
    // Whole words: "Olivenza" (ficha 6) is a town, not an olive grove.
    { re: /\bolives?\b|olivar|\bolivos?\b|\baceite\b/i, label: 'Finca Olivarera' },
    { re: /agricultural|agr[ií]cola/i, label: 'Finca Agrícola' },
];
const EQUESTRIAN = /equestrian|ecuestre|polo/i;
const TYPE_LABELS = { finca: 'Finca', villa: 'Villa', mansion: 'Mansión' };

const fold = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const propertyKind = (property) => {
    const title = property.title || '';
    const type = TYPE_LABELS[fold(property.type)] || 'Inmueble';
    if (EQUESTRIAN.test(title)) return /cortijo/i.test(title) ? 'Cortijo Ecuestre' : 'Finca Ecuestre';
    const hits = KINDS
        .map(k => ({ label: k.label, at: title.search(k.re) }))
        .filter(k => k.at >= 0)
        .sort((a, b) => a.at - b.at);
    // A villa or mansion keeps its type unless the title names a palace.
    if (type !== 'Finca') {
        const palace = hits.find(k => k.label === 'Palacete' || k.label === 'Palacio');
        return palace ? palace.label : type;
    }
    return hits.length ? hits[0].label : type;
};

// Words that mark a title segment as a description, not a proper name.
const NOT_A_NAME = /\b(estate|luxury|exceptional|equestrian|sale|for|with|near|and|of|in|villa|cortijo|casa|gran|palacete|palace|hacienda|viñedo|modernista|residence|con|en|venta)\b/i;

/**
 * The proper name in a listing's title, if it has one: "Molino del Hortelano —
 * Historic Olive Estate..." gives "Molino del Hortelano"; "Finca Las Flores en
 * Tarifa: jardines..." gives "Finca Las Flores". Conservative on purpose: a
 * descriptive or English title gives no name rather than a wrong one.
 */
export const propertyName = (property) => {
    let head = (property.title || '').split(/\s[—–|]\s|:\s/)[0].trim();
    const city = fold(property.city);
    if (city && fold(head).endsWith(` en ${city}`)) head = head.slice(0, head.length - city.length - 4).trim();
    const words = head.split(/\s+/);
    if (words.length < 2 || words.length > 4) return '';
    if (/\d/.test(head) || head === head.toUpperCase()) return '';
    if (!/^[A-ZÁÉÍÓÚÑ]/.test(head)) return '';
    // "Finca" opens a name only when a capitalised article follows ("Finca Las
    // Palmeras"); otherwise it is the start of a description.
    if (/^finca\b/i.test(head)) return /^Finca (Las|Los|La|El)\s+[A-ZÁÉÍÓÚÑ]/.test(head) ? head : '';
    return NOT_A_NAME.test(head) ? '' : head;
};

const place = (p) => (fold(p.city) === fold(p.province) || !p.province ? p.city : `${p.city}, ${p.province}`);

const fit = (max, ...candidates) => candidates.find(c => c && c.length <= max) || candidates.filter(Boolean).pop();

const num = (n, digits = 0) => Number(n).toLocaleString('es-ES', { maximumFractionDigits: digits });

/**
 * "{Nombre}: {Tipo} en {Municipio}, {Provincia}" or, without a name,
 * "{Tipo} en {Municipio}, {Provincia}". Two listings that would share a title
 * (pass the whole list as `all`) are told apart by their land or built area.
 */
export const propertySeoTitle = (property, all = []) => {
    const kind = propertyKind(property);
    const name = propertyName(property);
    const lead = name ? (fold(name).includes(fold(kind)) ? name : `${name}: ${kind}`) : kind;
    const base = (p) => {
        const n = propertyName(p);
        const k = propertyKind(p);
        return `${n ? (fold(n).includes(fold(k)) ? n : `${n}: ${k}`) : k} en ${place(p)}`;
    };
    let title = `${lead} en ${place(property)}`;
    const twins = all.filter(p => p.id !== property.id && base(p) === title);
    if (twins.length) {
        const size = landLabel(property) || (property.area > 0 ? `${num(property.area)} m²` : `ref. ${property.id}`);
        title = `${lead} de ${size} en ${place(property)}`;
    }
    return fit(TITLE_MAX, title, title.replace(/, [^,]+$/, ''), `${kind} en ${property.city}`);
};

// Land as buyers read it: hectares for anything from one hectare up, square
// metres below. A finca with under 500 m² of land is a data-entry slip (ficha
// 19 holds 48, its hectares), so it is left out rather than printed.
export const landLabel = (p) => {
    const plot = Number(p.plot);
    if (!(plot > 0)) return '';
    if (fold(p.type) === 'finca' && plot < 500) return '';
    return plot >= 10000 ? `${num(plot / 10000, 1)} ha` : `${num(plot)} m² de parcela`;
};

/**
 * "{Tipo} en venta en {Municipio} ({Provincia}): {terreno}, {m² construidos} y
 * {dormitorios}. {Precio}. Solicite el dossier privado por email." Parts with
 * no data are left out, and the sentence shortens to stay within 155.
 */
export const propertySeoDescription = (property) => {
    const kind = propertyKind(property);
    const sentenceKind = kind.charAt(0) + kind.slice(1).toLowerCase();
    const where = fold(property.city) === fold(property.province) || !property.province
        ? property.city
        : `${property.city} (${property.province})`;
    const facts = [
        landLabel(property),
        property.area > 0 ? `${num(property.area)} m² construidos` : '',
        property.bedrooms > 0 ? `${property.bedrooms} ${property.bedrooms === 1 ? 'dormitorio' : 'dormitorios'}` : '',
    ].filter(Boolean);
    const factText = facts.length > 1 ? `${facts.slice(0, -1).join(', ')} y ${facts.at(-1)}` : (facts[0] || '');
    const price = property.price_on_demand || !(property.price > 0) ? 'Precio a consultar' : `${num(property.price)} €`;
    const name = propertyName(property);
    const head = `${sentenceKind} en venta en ${where}${factText ? `: ${factText}` : ''}.`;
    const named = name ? `${name}. ${head}` : head;
    return fit(META_MAX,
        `${named} ${price}. Solicite el dossier privado por email.`,
        `${head} ${price}. Solicite el dossier privado por email.`,
        `${head} ${price}.`,
        head);
};
