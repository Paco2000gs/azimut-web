# Estado SEO — azimutproperty.com

**Fuente única de verdad** para la indexación y la captación orgánica de esta web.
Lee este archivo antes de empezar cualquier trabajo SEO y actualízalo al terminar.

Última actualización: 29-oct-2026 · `main` en `738d36c`

Unifica lo trabajado en las sesiones "Metadatos azimutproperty" (sep–oct) y
"Problemas de indexación Google" (20–22 oct). Documentos anteriores de esta carpeta:
[GSC-ACCIONES.md](GSC-ACCIONES.md) (jul) y [ENLACES-PLAN.md](ENLACES-PLAN.md) (ago).
Si alguno contradice este archivo, manda este.

---

## 1. Decisiones vigentes

| Decisión | Desde | Notas |
|---|---|---|
| **Español es el idioma principal** de la web; las landings en inglés van emparejadas con su versión `/es/` | 22-oct | Sustituye a la decisión del 13-sep de poner la portada en inglés |
| `/en/*` redirige con 301 a la raíz | — | En `vercel.json`; `/en/` sigue rastreable en `robots.txt` para que Google siga el 301 |
| Nicho: fincas rústicas, cortijos, haciendas y fincas ecuestres de lujo en Andalucía; comprador extranjero de alto patrimonio | ago | Ver perfil en `ENLACES-PLAN.md` |
| Horario y teléfono de contacto no se tocan | 22-oct | Petición expresa |
| Foto de la sección de autoridad de la portada: campo de polo de la finca ecuestre de Jimena (ficha 19) | 22-oct | `public/media/authority-polo-estate-*` |
| Enlaces: nada de paquetes comprados, solo sitios reales | ago | `ENLACES-PLAN.md` |

## 2. Línea base de Search Console

Periodo **15-ago a 11-sep-2026** (28 días, antes del despliegue del 13-sep):

| Métrica | Valor |
|---|---|
| Clics | 43 |
| Impresiones | 2.101 |
| CTR | 2,05 % |
| Posición media | 30,9 |
| Impresiones en funciones de IA | 127 |
| **Consultas en inglés** | **586 impresiones · 0 clics** (KPI clave) |

Dashboard: https://claude.ai/code/artifact/6faf4e50-c961-42f8-8ee7-70e8ae32724b

**Todavía no hay segunda medición.** El export pedido el 14-oct no se llegó a pasar.
Como el 22-oct se cambió el idioma de toda la web, la comparación útil es ahora un
export de 28 días que empiece después del 22-oct (es decir, a partir del ~19-nov).

## 3. Cambios desplegados

| Fecha | Commit(s) | Cambio |
|---|---|---|
| 13-sep | — | Metadatos de la portada en inglés; Cádiz/Sevilla reposicionadas al nicho lujo-rústico; 4 landings EN: `/villas-marbella`, `/mansions-sotogrande`, `/equestrian-estates-jimena-de-la-frontera`, `/olive-estates-sevilla` |
| 27-sep | `cb28292`, `7b2f584` | Medidor de uso de Supabase Storage y compresión de imágenes al subir (admin) |
| 20-oct | `93de626` | Títulos y descripciones en español en ciudades, silos y catálogo |
| 22-oct | `309a4a5` | 301 de fichas 404 y silos detectados en Search Console (`vercel.json`) |
| 22-oct | `9a27044` | Landings `/cortijos-en-venta-sevilla`, `-huelva`, `-cadiz` (solo ES) |
| 22-oct | `d327325` | Artículos relacionados en cada post del blog (enlazado interno) |
| 22-oct | `8c0ea75` | Datos de empresa alineados con el nicho rural andaluz (JSON-LD, `llms.txt`, pie) |
| 22-oct | `76a4305` | Toda la web en español: cabecera, pie, portada, páginas y metadatos |
| 22-oct | `38f2840` | `sitemap.xml` con las landings de cortijos y de colecciones: **68 URLs** |
| 22-oct | `b731f16` | Foto del campo de polo en la portada |
| 23-oct | `598030c` | Provincia de Barcelona y 47 municipios en el catálogo (ver decisión abierta 6.4) |

Acciones en Search Console ya hechas por Paco (22-oct): sitemap reenviado y
solicitud de indexación de las tres landings de cortijos.

## 4. Pendientes técnicos (código)

- [ ] `noindex` en silos con pocos inmuebles. Requiere contar inmuebles por silo en Supabase.
- [ ] `public/llms.txt` sigue en inglés y tiene precios escritos a mano: traducir y revisar precios.
- [ ] Las descripciones de las fichas llegan en inglés desde Supabase: pasarlas a español (dato, no código).
- [ ] Medición de leads: GA4 y botón de WhatsApp fijo.
- [ ] Core Web Vitals: sin datos suficientes en Search Console todavía.
- [ ] `scripts/generate-sitemap.js` necesita Supabase y no funciona desde la nube: el sitemap se ha editado a mano. Regenerarlo en local cuando haya fichas nuevas.

## 5. Pendientes manuales de Paco (Search Console, Vercel, cuentas)

- [ ] Quitar la entrada errónea `/property/finca-vera-29` de la lista de Sitemaps, si sigue ahí.
- [ ] Comprobar en producción la foto nueva de la portada.
- [ ] **A partir del ~19-nov:** export de Search Console de 28 días (Consultas + Páginas + País) para compararlo con la línea base.
- [ ] Al mismo tiempo: informe de **Páginas** para ver qué URLs siguen sin indexar y por qué.
- [ ] Comprobar si están indexadas las 4 landings EN del 13-sep y las 3 de cortijos.
- [ ] Dominio duplicado `azimutrealestate.es` → 301 a `azimutproperty.com` (pendiente desde julio, requiere acceso a su DNS o hosting). Estado sin confirmar.

## 6. Decisiones abiertas (las toma Paco)

1. **¿Versión `/en/` completa?** Hoy solo hay landings EN sueltas. Requiere traducir el contenido.
2. **Disavow.** `GSC-ACCIONES.md` (jul) lo marcaba como prioridad alta; la revisión de oct concluyó que
   `dudley-estates.com` es un socio legítimo y **no** debe ir en el disavow. Decidir si se sube el
   archivo y con qué dominios.
3. **Revisión legal** de las versiones en español de privacidad y condiciones (traducidas el 22-oct).
4. **Barcelona.** Se añadió al catálogo el 23-oct, pero todo el posicionamiento (JSON-LD, `llms.txt`,
   textos) habla de Andalucía. Decidir si el nicho se amplía o Barcelona queda como excepción sin SEO propio.

## 7. Ramas del repo

Comprobado el 29-oct-2026. Solo `main` se despliega en producción.

| Rama | Sin fusionar en `main` | Contenido | Estado |
|---|---|---|---|
| `feature/redes-sociales` | 5 commits (23–28 oct) | Borradores IA y publicación en redes (dry-run) | **No está en producción.** Falta la prueba en dry-run, PR a `main`, variables de entorno y alta de las apps. Lleva dentro una copia anterior del commit de Barcelona (`09353ec`), que ya está en `main` como `598030c` |
| `ccr-5f89aeba-9r22dw` | 2 commits (1 oct) | Skills `yt-*` y perfil de voz para el canal El Caminante de Emaús | No es de esta web. Probablemente no deba fusionarse aquí |
| `ccr-151cf3f0-tu6b1t` | 1 commit (2 oct) | Skill prompt-master | No es de esta web |
| `backup/main-pre-seo-metadata-20260913` | — | Copia de `main` antes del despliegue SEO del 13-sep | Conservar como respaldo |

Ramas SEO ya fusionadas en `main` y **pendientes de borrar** desde GitHub → Branches
(las sesiones de Claude en la nube no pueden borrar ramas): `ccr-dc3024b6-km4k3a`,
`claude/azimutproperty-metadata-ho6r8x` y `claude/jolly-fermi-v1179g`.

## 8. Cómo actualizar este archivo

Al cerrar cada bloque de trabajo: añade una fila a la sección 3 con commit y fecha,
marca o quita los pendientes resueltos, revisa la sección 7 de ramas y cambia la fecha de arriba.
Las cifras sin fuente se marcan como **[sin verificar]**.
