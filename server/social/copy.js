/* eslint-env node */
import { request } from './http.js';
import { clampDraft } from './text.js';
import { propertyFacts, formatPrice } from './property.js';

const PROMPT = `Eres el redactor de redes sociales de Azimut Property, inmobiliaria de lujo en España para compradores internacionales.
Escribe en ESPAÑOL, con tono elegante, sobrio y profesional. Sin exageraciones ni clichés ("¡Oportunidad única!", "¡No te lo pierdas!").
Usa SOLO los datos de la propiedad que te doy. No inventes cifras, vistas, distancias, materiales ni servicios que no aparezcan.
Si la descripción viene en inglés, tradúcela al español.
No escribas la URL en ningún texto: el sistema la añade.
Hashtags sin el símbolo #, sin espacios, relevantes (tipo de inmueble, ciudad, provincia, lujo, inversión).

Un texto distinto por red:
- linkedin.body: 700-1200 caracteres. Enfoque de inversión y mercado. Sin emojis. Termina invitando a ver la ficha completa. hashtags: 3-5.
- facebook.body: 300-550 caracteres. Cercano pero elegante. Como mucho 2 emojis. Termina invitando a ver la ficha. hashtags: 3-5.
- instagram.body: 600-1300 caracteres. Frases cortas y visuales, saltos de línea. Como mucho 3 emojis. Debe terminar con "Enlace en la bio." hashtags: 10-15.
- youtube.title: máximo 70 caracteres, sin emojis, con tipo de inmueble y ubicación.
- youtube.body: 400-900 caracteres. Descripción del vídeo de la propiedad. Sin emojis. hashtags: 3-5.

Datos de la propiedad (JSON):
`;

const schema = {
    type: 'object',
    properties: Object.fromEntries(['linkedin', 'facebook', 'instagram', 'youtube'].map(n => [n, {
        type: 'object',
        properties: {
            ...(n === 'youtube' ? { title: { type: 'string' } } : {}),
            body: { type: 'string' },
            hashtags: { type: 'array', items: { type: 'string' } },
        },
        required: n === 'youtube' ? ['title', 'body', 'hashtags'] : ['body', 'hashtags'],
    }])),
    required: ['linkedin', 'facebook', 'instagram', 'youtube'],
};

/**
 * Template used when there is no Gemini key (local dev, tests) or the model
 * call fails. Plain and factual, so a human reviewer always has something to
 * edit instead of an empty draft.
 */
export const templateCopy = (property) => {
    const where = [property.city, property.province].filter(Boolean).join(', ');
    const facts = [
        Number(property.bedrooms) ? `${Number(property.bedrooms)} dormitorios` : null,
        Number(property.bathrooms) ? `${Number(property.bathrooms)} baños` : null,
        Number(property.area) ? `${Number(property.area).toLocaleString('es-ES')} m² construidos` : null,
        Number(property.plot) ? `parcela de ${Number(property.plot).toLocaleString('es-ES')} m²` : null,
    ].filter(Boolean).join(' · ');
    const price = formatPrice(property);
    const head = `${property.type || 'Propiedad'} en ${where}`;
    const tags = [property.type, property.city, property.province, 'InmobiliariaDeLujo', 'AzimutProperty'];
    return {
        linkedin: { body: `${head}.\n\n${property.title}\n\n${facts}\n${price}\n\nConsulte la ficha completa en nuestra web.`, hashtags: tags },
        facebook: { body: `${head}. ${facts}. ${price}.\n\nToda la información en la ficha.`, hashtags: tags },
        instagram: { body: `${head}\n\n${facts}\n${price}\n\nEnlace en la bio.`, hashtags: [...tags, 'LuxuryRealEstate', 'Spain'] },
        youtube: { title: `${property.type || 'Propiedad'} en venta en ${where}`, body: `${property.title}\n\n${facts}\n${price}`, hashtags: tags.slice(0, 4) },
    };
};

const parseJson = (text) => JSON.parse(String(text || '').replace(/^```(?:json)?\s*|\s*```$/g, ''));

/**
 * One Gemini call returns the four texts; each is then clamped to its
 * network's limits so nothing the model writes can break a publish.
 *
 * Returns { drafts: {network: {title?, body, hashtags}}, generator, error? }.
 */
export const generateCopy = async ({ property, link, config, fetchImpl = fetch }) => {
    const finish = (raw, generator, error) => ({
        generator,
        ...(error ? { error } : {}),
        drafts: Object.fromEntries(Object.entries(raw).map(([network, d]) => [
            network,
            clampDraft(network, { ...d, link }),
        ])),
    });

    if (!config.gemini.apiKey) return finish(templateCopy(property), 'plantilla');

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.gemini.model)}:generateContent`;
        const { body } = await request(fetchImpl, url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.gemini.apiKey },
            body: JSON.stringify({
                contents: [{ parts: [{ text: PROMPT + JSON.stringify(propertyFacts(property, link), null, 2) }] }],
                generationConfig: {
                    temperature: 0.7,
                    responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema } },
                },
            }),
        }, { label: 'gemini', retries: 2 });

        const text = body?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('');
        const parsed = parseJson(text);
        for (const n of ['linkedin', 'facebook', 'instagram', 'youtube']) {
            if (!parsed?.[n]?.body) throw new Error(`Gemini response missing ${n}`);
        }
        return finish(parsed, `gemini:${config.gemini.model}`);
    } catch (err) {
        return finish(templateCopy(property), 'plantilla', `IA no disponible, se usó la plantilla: ${err.message}`);
    }
};
