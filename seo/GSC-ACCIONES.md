# Acciones SEO azimutproperty.com — requieren acceso del usuario (no automatizables)

Basado en el diagnóstico Semrush (28 jul 2026). El código ya implementa casi todo
el contenido recomendado; lo que queda son acciones externas en cuentas del usuario.

## 1. Disavow del perfil PBN tóxico  [PRIORIDAD ALTA — root cause #1]
- Perfil marcado "Peligroso" por Semrush: link farms + 25,3% dominios sin categoría.
- Completar `disavow-azimutproperty.txt` con la lista real de dominios (ver instrucciones dentro).
- Subir en Google Search Console > https://search.google.com/search-console/disavow-links
- Efecto: neutraliza la desconfianza algorítmica (SpamBrain/Penguin). Tarda semanas.

## 2. Forzar reindexación (la web es reconstrucción reciente)
- Semrush muestra 5 keywords porque Google aún no ha recrawleado la web nueva.
- GSC > Sitemaps > enviar https://www.azimutproperty.com/sitemap.xml
- GSC > Inspección de URL > pedir indexación de home + /venta + 5-10 fichas top.
- Verificar cobertura: que las páginas de provincia (venta/cadiz, venta/sevilla...) estén "Indexadas".

## 3. Consolidar dominio duplicado azimutrealestate.es  [decisión de negocio]
- Existe dominio hermano con 89 keywords propias -> divide autoridad de marca.
- Elegir dominio canónico (recomendado: azimutproperty.com, es el activo con la web nueva).
- Redirección 301 permanente de todo azimutrealestate.es -> azimutproperty.com (mapeo página a página cuando exista equivalente, resto a la home).
- Requiere acceso a DNS/hosting del dominio duplicado. No automatizable desde el código.

## 4. Verificar canibalización marca (home vs /about)  [menor]
- El código ya usa canonical único por página, así que no hay canibalización técnica.
- Si en GSC ambas siguen apareciendo para "azimut real estate", es normal (términos de marca).
- No requiere cambio de código.

## Ya resuelto en el código (no requiere acción)
- Home reposicionada a keyword comercial rural (Casas Rurales/Fincas Cádiz-Huelva-Sevilla).
- Contenido extenso por provincia con keywords del nicho (cortijo, finca, hacienda, olivar).
- FAQ schema, BreadcrumbList, ItemList, RealEstateAgent schema, llms.txt, robots con crawlers IA.
- Fix: URLs de tipo en plural del sitemap (/fincas, /villas, /mansions) ahora filtran (antes servían duplicado).
- Fix: silo links en ciudades multi-palabra ahora generan slug válido.
- Fix: enlace home "VIEW ALL" apunta directo a /venta (sin salto 301).
