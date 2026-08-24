/**
 * URLs de imagen optimizadas.
 *
 * HISTORIA (24-ago-2026, cuota de Supabase al 463%):
 *
 *  1. El codigo pedia 8 tamanos distintos de la misma foto con
 *     `?width=W&height=H&quality=Q&resize=cover` sobre `/object/public/`.
 *  2. Ese endpoint IGNORA esos parametros. Medido: el original y el
 *     "?width=400" devolvian exactamente los mismos 487 KB. La transformacion
 *     de Supabase esta en `/render/image/public/` y en este proyecto responde
 *     403 FeatureNotEnabled: no viene con el plan Gratuito.
 *  3. Resultado: cada foto servia SIEMPRE el original completo, y encima
 *     cacheado 8 veces bajo 8 URLs distintas. De ahi los 23 GB.
 *
 * ARREGLO: las fotos pasan por el optimizador de Vercel (`/_vercel/image`),
 * declarado en vercel.json. Vercel descarga el original de Supabase UNA vez
 * por (url, ancho), lo convierte a WebP y lo cachea 30 dias. Los bots pegan a
 * Vercel, no a Supabase. Solo 3 anchos canonicos, para no multiplicar cache.
 */

const ANCHOS = [400, 800, 1600];
const CALIDAD = 75;

const snap = (n) => {
    // Redondeo hacia ARRIBA: pedir 1200 da 1600. Perder resolucion en pantalla
    // grande se nota; pasarse 400 pixeles no.
    if (!n) return ANCHOS[ANCHOS.length - 1];
    return ANCHOS.find((v) => v >= n) ?? ANCHOS[ANCHOS.length - 1];
};

/**
 * @param {string} url  URL publica de Supabase (u otra)
 * @param {object} options
 *   - width: ancho deseado; se ajusta a 400 / 800 / 1600
 *   - raw:   true para devolver la URL ABSOLUTA sin optimizar. Necesario en
 *            og:image y JSON-LD: los rastreadores sociales no resuelven rutas
 *            relativas, y ademas solo la piden una vez.
 */
export const getOptimizedImageUrl = (url, options = {}) => {
    // Foto propia, no un placeholder externo: un hueco silencioso pinta mejor
    // que una caja gris ajena rota.
    if (!url) return '/media/placeholder.svg';
    if (!url.includes('supabase.co')) return url;
    if (options.raw) return url;

    const width = snap(options.width);
    // El optimizador de Vercel exige la URL de origen codificada.
    return `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=${CALIDAD}`;
};

export const SIZES = {
    thumb: { width: 400 },
    card: { width: 800 },
    full: { width: 1600 },
};
