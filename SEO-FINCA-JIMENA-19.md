# Estrategia SEO — Finca Jimena de la Frontera (ID 19)
## Fecha: 8 de junio de 2026

---

## Cambios Realizados (8 archivos modificados)

### 1. sitemap.xml — Propiedad añadida al sitemap
- Añadida `finca-jimena-de-la-frontera-19` con `priority 0.9` y `changefreq weekly`
- También añadidas propiedades 17 y 18 que faltaban

### 2. PropertyDetail.jsx — Rediseño SEO completo
- **Meta descripción enriquecida**: Incluye dormitorios, baños, superficie, parcela en ha, precio — máximo 320 caracteres cortando por palabra
- **Título SEO**: Cambiado de `Título | Ciudad` a `Título — Tipo en Ciudad, Provincia` (más keywords)
- **URL canónica**: Usa `generatePropertySlug()` en vez del parámetro URL crudo (corrige bug de slug/ID)
- **Schema.org `RealEstateListing`**: Añadido `@id`, array tipado de `ImageObject` con captions, `lotSize`, `additionalProperty` para características, `amenityFeature`, referencia `@id` a la organización broker
- **Corrección schema Offer**: Ya no emite `priceCurrency` sin `price` en propiedades "precio a consultar"
- **BreadcrumbList**: Expandido de 3 a 5 niveles (Inicio > Propiedades > Provincia > Ciudad > Título) coincidiendo con la UI
- **FAQPage schema**: 4 preguntas/respuestas dinámicas por propiedad (precio, ubicación, características, comprador extranjero) — mejora citación AI/LLM
- **Sección FAQ en página**: Preguntas expandibles con `<details>` renderizadas en la página
- **Precio por m²**: Ahora se muestra bajo la etiqueta de precio para transparencia
- **Descripción**: Renderiza con saltos de párrafo (`\n\n`) en vez de un solo bloque `<p>`
- **Imagen OG**: Usa imagen optimizada 1200x630 (ratio para redes sociales)
- **Keywords**: Ampliadas para incluir `finca`, `country estate`, `for sale`, términos a nivel provincia

### 3. SEO.jsx — Truncamiento inteligente de descripción
- Las descripciones ahora se cortan por palabra completa (sin cortar a mitad de palabra)

### 4. LocationSEOContent.jsx — Contenido para Jimena de la Frontera
- Añadidas ~700 palabras de contenido rico y autoritativo sobre Jimena de la Frontera
- Cubre: fincas ecuestres, polo, Parque Natural Alcornocales, proximidad a Sotogrande, alcornocales, dehesa
- 4 FAQs con precios, distancias, análisis de inversión, info para compradores extranjeros
- CTA de contacto
- Añadido `jimena-de-la-frontera` a la lista de provincias rurales para renderizado de CTA

### 5. llms.txt — Mejora de visibilidad AI
- Añadida sección "Featured Properties" con esta finca como primera propiedad destacada
- Specs completas inline: campo de polo, cuadras, Alcornocales, 25 km de Sotogrande
- Jimena de la Frontera añadida a Key Markets bajo Cádiz
- "Equestrian estates with polo fields" añadido a Property Types

### 6. Home.jsx — Teléfono placeholder eliminado
- Reemplazado el falso `+34-600-000-000` por email real en schema

### 7. index.html — Teléfono placeholder eliminado
- Misma corrección, eliminado campo email duplicado

---

## Acciones Pendientes (no se pueden hacer solo desde código)

| Prioridad | Acción | Por qué |
|-----------|--------|---------|
| **CRÍTICO** | Añadir número de teléfono real al schema + botón WhatsApp | Datos NAP falsos = riesgo de penalización Google |
| **ALTO** | Publicar artículo blog en Supabase: "Comprar finca ecuestre en Jimena de la Frontera" | Crea contenido rastreable que bots AI pueden indexar inmediatamente. Blog se pre-renderiza. |
| **ALTO** | Enriquecer descripción de propiedad en Supabase | Añadir dimensiones campo polo, nº cuadras, paddocks, derechos agua, hectáreas, distancias a Sotogrande/Gibraltar/Málaga |
| **ALTO** | Ejecutar `npm run build` y desplegar en Vercel | Todos los cambios necesitan pre-renderizado + despliegue para tomar efecto |
| **MEDIO** | Enviar sitemap a Google Search Console | Forzar re-rastreo del sitemap actualizado con la nueva propiedad |
| **MEDIO** | Usar API IndexNow para notificar a Bing | Notificación instantánea de indexación para la nueva URL |
| **BAJO** | Eliminar/corregir hreflang con prefijo `/en/` | Apunta a rutas inglesas que no existen — peor que no tener hreflang |
