# Plan: versiones en inglés y hreflang de la home y las categorías

Punto 13 del informe de mejoras del 21/11/2026 («Versiones en inglés y hreflang en home y categorías»).
Estado: **propuesta, no ejecutada.** Crear páginas en inglés necesita el OK del cliente.

## Qué hay hoy (comprobado en `dist/` el 24/11/2026)

| Páginas | Versión inglesa real | hreflang hoy |
|---|---|---|
| 4 landings de zona: Marbella, Sotogrande, Jimena de la Frontera, Sevilla | Sí: `/villas-marbella`, `/mansions-sotogrande`, `/equestrian-estates-jimena-de-la-frontera`, `/olive-estates-sevilla` ↔ `/es/…` | `en` + `es` + `x-default` (inglés), recíproco en las dos versiones |
| Home `/` | No | `es` + `x-default` a sí misma |
| Categorías `/venta`, `/venta/<lugar>`, `/venta/<lugar>/<tipo>` | No | `es` + `x-default` a sí misma |
| Landings de cortijos (Sevilla, Huelva, Cádiz) | No | `es` + `x-default` a sí misma |
| Fichas `/property/…` | No. El HTML es español; el H1 y la descripción siguen en inglés en Supabase | `es` + `x-default` a sí misma |
| Blog | Cada artículo existe en un solo idioma | Su idioma + `x-default` a sí mismo |

El informe describe la home y las categorías como «hoy solo x-default y es». Es correcto que sea así: un hreflang `en` solo puede apuntar a una página inglesa que exista. Las antiguas `/en/…` devolvían 404 o noindex, y Search Console las sigue listando; por eso no se ha añadido ninguna.

## Por qué merece la pena

Datos del informe (Search Console, 23/08-20/11/2026):

- Reino Unido: 433 impresiones, posición 42,1, CTR 1,6 %.
- Suiza: CTR 13 %, posición 9,7.
- Alemania: CTR 7,2 %, posición 9,2.
- Gibraltar: CTR 33,3 %.

Hay demanda internacional que hoy llega a páginas en español o a las 4 landings inglesas.

## Propuesta

### 1. Alcance de la primera tanda

Empezar por las páginas que reciben esa demanda y tienen stock:

1. La home.
2. `/venta`.
3. Las provincias con fichas: Cádiz, Sevilla, Málaga y Huelva.

Las fichas van en una segunda tanda (ver punto 5).

### 2. URLs

- Prefijo `/en/` para las páginas nuevas: `/en` (home), `/en/for-sale`, `/en/for-sale/<provincia>`.
- Una `/en` real también convierte en página válida la URL que hoy da 404 en Search Console.
- Las 4 landings inglesas se quedan donde están. Moverlas bajo `/en/` exigiría redirecciones 301 de URLs con tráfico, y eso necesita el OK del cliente.

### 3. Contenido

- Texto escrito o revisado por una persona, no traducción automática.
- Titles en inglés de 60 caracteres como máximo y metas de 155, únicos por URL.
- Las cifras salen de Supabase, nunca del texto.
- Contacto: solo `info@azimutproperty.com`, desde `src/constants/contact.js`.

### 4. Técnica

- **Rutas:** nuevas rutas en `src/App.jsx` con `lang="en"`. El texto de interfaz va en un diccionario por idioma, como hace `STR` en `src/pages/LandingPage.jsx`.
- **hreflang:** cada página del par pasa `alternates` (en, es, x-default) a `SEO`. El componente ya lo admite y es lo que usan las landings.
- **x-default:**
  - Home y categorías: la versión española, que es el mercado principal y la URL que ya posiciona.
  - Las 4 landings: mantienen la inglesa.
- **Prerender y sitemap:**
  - Añadir las rutas a la lista de `scripts/prerender.js`. En Vercel, una ruta sin prerender responde 404.
  - Añadirlas también a `scripts/generate-sitemap.js`.
- **Selector de idioma:** solo en páginas que tengan par, como ya hace el enlace «English / Español» de las landings.
- **Comprobación en `dist/` antes de cada despliegue,** como la que se hizo en esta fase (el script no está en el repo). Verifica cinco cosas:
  - autorreferencia;
  - reciprocidad;
  - `x-default`;
  - que cada destino esté prerenderizado y sea indexable;
  - que el `lang` del destino coincida con su `hreflang`.

### 5. Fichas (segunda tanda)

Hoy cada ficha mezcla dos idiomas: el HTML es español, pero el H1 y la descripción guardados en Supabase están en inglés. Hay dos caminos, y los dos tocan datos de Supabase, así que necesitan el OK del cliente:

- **a) Dos versiones.** Añadir columnas de título y descripción en español. Publicar `/property/…` en español y `/en/property/…` en inglés, enlazadas con hreflang.
- **b) Una sola versión.** Mantener una única ficha en español y traducir su texto en Supabase.

### 6. Alemán

Solo si, tras la tanda inglesa, las impresiones desde Alemania y Suiza lo justifican, como dice el informe.

## Riesgos

- Doble mantenimiento: cada cambio de texto o de stock se hace en dos idiomas.
- Una página inglesa sin stock o con texto pobre canibaliza a la española sin ganar posiciones.
- Una traducción automática sin revisar puede tratarse como contenido de poco valor.

## Cómo medirlo

Cada mes, en Search Console:

- Impresiones, CTR y posición por país (Reino Unido, Suiza, Alemania, Gibraltar).
- Páginas `/en/` indexadas.
- Errores de hreflang.

Y en GA4, los leads por idioma de la página.
