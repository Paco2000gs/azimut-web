# Alta de cuentas y apps de desarrollador — Guía para Paco

> Todo lo de esta guía lo haces **tú, a mano**: crear cuentas, apps, revisiones y dar permisos OAuth. El código nunca verá tus contraseñas.
> Fecha de verificación: 26-10-2026. Lo marcado **[sin verificar]** compruébalo en pantalla cuando llegues a ese paso, porque los paneles de Meta, LinkedIn y Google cambian a menudo.

## 0. Antes de empezar

- [ ] **Correo de registro:** usa `info@azimutproperty.com` (o un alias como `social@`) para todas las cuentas de marca, no tu correo personal. Así las cuentas son de la empresa.
- [ ] **Gestor de contraseñas y 2FA** en todas las cuentas. Guarda los códigos de recuperación fuera del ordenador.
- [ ] **Logo cuadrado en alta resolución.** El logo más grande del repo es `public/azimut-logo-gold.png`, de **442×460 px**: no es cuadrado y se queda corto para YouTube (800 px). Pide al diseñador el original (SVG o AI) y exporta:
  - `logo-cuadrado-1080.png`: 1080×1080, fondo sólido (no transparente) y el emblema centrado con margen, porque todas las redes recortan el avatar en círculo.
  - Las portadas de cada red, con las medidas de la tabla del apartado 2.
- [ ] **Política de privacidad pública:** ya existe en `https://www.azimutproperty.com/privacy`. Meta, LinkedIn y Google la piden. Antes de la Fase 2 hay que añadirle un párrafo sobre la publicación en redes sociales (lo redacto yo en la Fase 2 y tú lo revisas).

## 1. Handle unificado

Comprobado el 26-10-2026 desde un navegador sin sesión iniciada:

| Red | `azimutproperty` | Resultado observado |
|-----|------------------|---------------------|
| Instagram | **Probablemente libre** | «Profile no está disponible». Como control, `@instagram` sí carga |
| Facebook | **Probablemente libre** [sin verificar] | «Este contenido no está disponible». Facebook muestra lo mismo si la página existe pero es restringida |
| LinkedIn | **Probablemente libre** | `linkedin.com/company/azimutproperty` devuelve 404 |
| YouTube | **Libre** | `@azimutproperty` devuelve 404. Como control, `@YouTube` sí carga |
| TikTok | **Libre** | «No se pudo encontrar esta cuenta» |
| Pinterest | No concluyente | La página no respondió sin sesión |

**Recomendación:** registra `azimutproperty` en todas **hoy mismo**, aunque aún no vayas a publicar, para que nadie lo ocupe.

**Alternativas, por orden de preferencia, si alguna está ocupada:**
1. `azimut.property` (Instagram y TikTok admiten el punto; YouTube también. Libre en Instagram y YouTube según la misma prueba)
2. `azimutproperties` (libre en YouTube)
3. `azimut_property`
4. `azimutpropertyes` / `azimut.realestate` [sin verificar]

## 2. Medidas de logo y portada

| Red | Avatar / logo | Portada / banner | Fuente |
|-----|---------------|-------------------|--------|
| LinkedIn (página) | **400×400** (mínimo 268×268) | **1512×256** (también es el mínimo) | PNG o JPG, ≤ 3 MB ([LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a563309)) |
| YouTube | 800×800 [sin verificar, dato de terceros; se muestra a 98×98 en círculo] | **2560×1440** recomendado, mínimo 2048×1152 (16:9); **área segura para texto y logo: 1235×338** (a tamaño mínimo); ≤ 6 MB | [YouTube Help](https://support.google.com/youtube/answer/10456525) |
| Facebook (página) | 720×720 o más [sin verificar] | Se muestra a 851×315 en escritorio y 640×360 en móvil [sin verificar]: deja lo importante en la franja central | Comprueba en [FB Help](https://www.facebook.com/help/125379114252045) al subirla |
| Instagram | 320×320 o más [sin verificar]; usa el de 1080×1080 | — (no tiene portada) | — |

El avatar es el mismo en todas las redes (`logo-cuadrado-1080.png`). Las portadas, con fondo de una foto de propiedad, el logo y una línea como mucho («Exclusive properties in Spain»).

## 3. Bios (borradores)

### Español

**Corta (≤ 150 caracteres: Instagram, Facebook, TikTok)**
> Propiedades exclusivas en España: villas, fincas y residencias de lujo para compradores internacionales. ✉ info@azimutproperty.com

**Lema de LinkedIn (≤ 120 caracteres [sin verificar el límite])**
> Inmobiliaria de lujo en España · Villas, fincas y cortijos para compradores internacionales

**Larga (LinkedIn «Acerca de», descripción de YouTube y de Facebook)**
> Azimut Property selecciona propiedades exclusivas en España para compradores e inversores internacionales: villas en Marbella y Sotogrande, fincas y cortijos en Andalucía, haciendas en Sevilla y residencias singulares en la costa de Barcelona.
> Acompañamos cada operación de principio a fin, con información clara sobre la propiedad, el entorno y el proceso de compra en España.
> Catálogo completo: www.azimutproperty.com · Contacto: info@azimutproperty.com

### English

**Short (≤ 150 characters)**
> Exclusive properties in Spain: luxury villas, country estates and residences for international buyers. ✉ info@azimutproperty.com

**LinkedIn tagline**
> Luxury real estate in Spain · Villas, fincas and country estates for international buyers

**Long**
> Azimut Property curates exclusive properties in Spain for international buyers and investors: villas in Marbella and Sotogrande, fincas and cortijos across Andalusia, haciendas in Seville and distinctive homes on the Barcelona coast.
> We guide every purchase from first viewing to completion, with clear information on the property, its surroundings and the buying process in Spain.
> Full portfolio: www.azimutproperty.com · Contact: info@azimutproperty.com

> Las zonas salen de las fichas publicadas hoy en la web. No he añadido cifras (años de experiencia, número de operaciones) porque no las tengo: añádelas tú si quieres.

## 4. Checklist por red

### 4.1 Meta: Facebook (página) + Instagram (cuenta Business)

**Tipo de cuenta correcto:** una **página de Facebook** y una cuenta de **Instagram profesional (Empresa)** vinculadas entre sí, ambas dentro de un **portfolio empresarial de Meta** (Business Manager). Usamos «Instagram API with Facebook Login», así que un único token de página publica en las dos redes ([verificado](https://developers.facebook.com/docs/instagram-platform/content-publishing)).

**Cuentas**
- [ ] 1. Entra en Facebook con tu perfil personal (Meta exige un perfil personal como administrador).
- [ ] 2. Crea el portfolio empresarial en `business.facebook.com` con el nombre «Azimut Property» y el correo `info@`.
- [ ] 3. Crea la **página de Facebook**: categoría «Inmobiliaria», nombre de usuario `azimutproperty`, web, correo, avatar y portada.
- [ ] 4. Crea la cuenta de **Instagram** `azimutproperty` y pásala a cuenta profesional del tipo **Empresa**: *Configuración → Tipo de cuenta y herramientas*.
- [ ] 5. Vincula Instagram a la página: desde la página de Facebook, en *Configuración → Cuentas vinculadas → Instagram* [sin verificar la ruta exacta del menú].
- [ ] 6. Añade la página y la cuenta de Instagram al portfolio empresarial.
- [ ] 7. Si la página te pide **«Autorización para publicar en la página»** (Page Publishing Authorization), complétala. Mientras esté pendiente, la API **no puede publicar** ([verificado](https://developers.facebook.com/docs/instagram-platform/content-publishing)).

**App de desarrollador**
- [ ] 8. En `developers.facebook.com` → *Mis apps → Crear app*. Tipo **Empresa (Business)**, vinculada al portfolio empresarial. Nombre: «Azimut Property Publisher».
- [ ] 9. *Configuración → Básica*:
  - Dominios de la app: `azimutproperty.com`
  - URL de la política de privacidad: `https://www.azimutproperty.com/privacy`
  - Icono de la app: el logo cuadrado
- [ ] 10. Añade el producto **Inicio de sesión con Facebook (para empresas)**. En *URI de redirección de OAuth válidos*:
  `https://www.azimutproperty.com/api/social/oauth/meta/callback`
- [ ] 11. **Permisos (scopes)** que pedirá la app:
  - `pages_show_list`, `pages_read_engagement`, `pages_manage_posts` (Facebook)
  - `instagram_basic`, `instagram_content_publish` (Instagram)
  - Si tu rol en la página te lo dio el Business Manager, Meta pide además `ads_management` y `ads_read` ([verificado](https://developers.facebook.com/docs/instagram-platform/content-publishing)). Lo veremos al conectar.
- [ ] 12. **Revisión de la app: no hace falta.** Las apps de tipo Empresa reciben **acceso estándar** automáticamente, y ese acceso funciona para las personas con rol en la app ([verificado](https://developers.facebook.com/docs/graph-api/overview/access-levels)). Como tú eres el administrador de la app y de la página, puedes publicar en tu propia página sin App Review ni verificación del negocio. Solo harían falta si otras personas ajenas a la app fueran a usarla.
- [ ] 13. Copia el **App ID** y la **App Secret** directamente en las variables de entorno de Vercel (`META_APP_ID`, `META_APP_SECRET`). **No me los pegues en el chat** ni los guardes en ningún archivo del repo.

**Plazo:** el mismo día. La «Autorización para publicar en la página», si la pide, puede tardar días [sin verificar].

### 4.2 LinkedIn (página de empresa)

**Tipo de cuenta correcto:** **página de empresa** (Company Page), no un perfil personal ni una página de *showcase*.

**Cuentas**
- [ ] 1. Con tu perfil personal de LinkedIn, crea la página en `linkedin.com/company/setup/new`:
  - Tipo: Empresa
  - URL: `linkedin.com/company/azimutproperty`
  - Sector: Real Estate
  - Tamaño, web, logo 400×400 y portada 1512×256
- [ ] 2. Comprueba que tu rol en la página es **Super admin** o **Content admin**. La API exige ADMINISTRATOR, CONTENT_ADMIN o DIRECT_SPONSORED_CONTENT_POSTER ([verificado](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)).
- [ ] 3. Anota el **ID numérico** de la página (aparece en la URL del panel de admin: `linkedin.com/company/12345678/admin`). Va en `LINKEDIN_ORGANIZATION_ID`.

**App de desarrollador**
- [ ] 4. En `linkedin.com/developers/apps` → *Create app*:
  - Nombre: «Azimut Property Publisher»
  - LinkedIn Page: Azimut Property
  - URL de privacidad y logo
- [ ] 5. **Verifica la asociación con la página:** LinkedIn genera un enlace de verificación que debe aprobar un admin de la página (tú).
- [ ] 6. En *Auth → Authorized redirect URLs*:
  `https://www.azimutproperty.com/api/social/oauth/linkedin/callback`
- [ ] 7. En *Products*, solicita **Community Management API**. Importante:
  - **Tiene que ser el único producto de esa app.** No añadas «Sign In with LinkedIn» ni «Share on LinkedIn» a esta misma app.
  - Si el botón aparece gris, crea una app nueva solo para esto ([fuente](https://learn.microsoft.com/en-us/linkedin/marketing/increasing-access)).
- [ ] 8. Rellena el formulario del **tier Development**. Caso de uso: «Publicar en la página de nuestra propia empresa los inmuebles que damos de alta en nuestra web, tras revisión manual».
  - Límites del tier Development: 500 llamadas al día por app y 100 por miembro; dura como máximo 12 meses.
  - Nuestro uso: unas 2N+1 llamadas por post (N = número de fotos), unas 25 por propiedad. Sobra.
- [ ] 9. **Scope:** `w_organization_social`.
  - [sin verificar] La guía de migración de LinkedIn menciona un nuevo `w_organization_social_feed`. Lo confirmaremos en la pantalla de *Auth* cuando te aprueben.
- [ ] 10. **Más adelante, tier Standard**, necesario antes de que pasen los 12 meses del tier Development. Se pide desde el Developer Portal con:
  - un **vídeo de pantalla** del flujo OAuth completo y de una publicación real;
  - política de privacidad válida;
  - credenciales de prueba, si las piden.
  - **Si lo rechazan, no se puede volver a pedir con la misma app:** habría que crear una nueva y empezar por el tier Development.
- [ ] 11. Client ID y Client Secret: directamente a Vercel (`LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`).

**Plazos:**
- Tier Development: [sin verificar].
- Tier Standard: LinkedIn da como orientación unos 30 días hábiles. Un usuario informa de 40 días hábiles en la primera etapa ([Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/5999694/community-management-api-standard-tier-review-at-s)); es un caso aislado, no un dato oficial.
- **Tokens:** el de acceso dura 60 días. La renovación automática solo está disponible para partners aprobados ([verificado](https://learn.microsoft.com/en-us/linkedin/shared/authentication/programmatic-refresh-tokens)). Hasta entonces, el panel te avisará 10 días antes para que reconectes con un clic.

### 4.3 YouTube (canal + app de Google)

**Tipo de cuenta correcto:** un **canal de marca** (cuenta de marca de Google) llamado «Azimut Property», no tu canal personal. Así puedes dar acceso a otras personas sin compartir tu cuenta de Google.

**Cuentas**
- [ ] 1. Con la cuenta de Google de `info@` (o la tuya), crea en YouTube un **canal con nombre de empresa o marca**.
- [ ] 2. Configura el identificador `@azimutproperty`, el banner de 2560×1440 (texto dentro de 1235×338), el avatar, la descripción (apartado 3) y los enlaces a la web.
- [ ] 3. Verifica el canal por teléfono en `youtube.com/verify`. Desbloquea, entre otras cosas, vídeos de más de 15 minutos y miniaturas personalizadas [sin verificar]. Nuestros vídeos duran menos de 1 minuto, pero conviene tenerlo.

**App de Google Cloud**
- [ ] 4. En `console.cloud.google.com`, crea el proyecto «azimut-social».
- [ ] 5. En *APIs y servicios → Biblioteca*, habilita **YouTube Data API v3**.
- [ ] 6. Configura la **pantalla de consentimiento** (Google Auth Platform):
  - Tipo de usuario: **Externo**
  - Nombre de la app, correo de soporte, logo
  - Dominio autorizado: `azimutproperty.com`
  - Política de privacidad: `https://www.azimutproperty.com/privacy`
  - Scope: `https://www.googleapis.com/auth/youtube.upload`
- [ ] 7. En *Credenciales → Crear ID de cliente OAuth*, tipo **Aplicación web**. URI de redirección:
  `https://www.azimutproperty.com/api/social/oauth/google/callback`
- [ ] 8. **Pasa la app a «En producción»** (*Publicar app*). **Este paso es obligatorio.** En modo «Prueba», el refresh token **caduca a los 7 días** y la publicación dejaría de funcionar sin avisar ([verificado](https://developers.google.com/identity/protocols/oauth2)).
  - Al conectar, Google mostrará «Google no ha verificado esta app». Como la app es tuya, pulsa *Configuración avanzada → Ir a azimut-social*.
- [ ] 9. Client ID y Client Secret: directamente a Vercel (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).

**Verificación y auditoría** (solo si los vídeos quedan bloqueados en privado):
- [ ] 10. **Verificación de la app de Google:** requiere verificar el dominio en Search Console, la política de privacidad y un vídeo de demostración del uso del scope. Plazo [sin verificar], normalmente semanas.
- [ ] 11. **Auditoría de los servicios de API de YouTube:** formulario de cumplimiento de YouTube [sin verificar la URL actual del formulario]. La documentación oficial se contradice sobre si los vídeos subidos desde apps no verificadas quedan forzados a privado (detalle en PLAN.md, apartado c). Lo comprobaremos con una subida `unlisted` de prueba en la Fase 3, **con tu OK**.

**Plazo:** pasar a producción es inmediato. La verificación y la auditoría, si hacen falta, tardan semanas [sin verificar].

### 4.4 Vercel y GitHub (para el sistema, no son redes)

- [ ] 1. **Deploy hook:** en Vercel → proyecto `azimut-web` → *Settings → Git → Deploy Hooks*. Nombre «social-property-published», rama `main`. Copia la URL a `VERCEL_DEPLOY_HOOK_URL`. **Es un secreto:** cualquiera que la tenga puede lanzar despliegues ([verificado](https://vercel.com/docs/deploy-hooks)).
- [ ] 2. **Revisa tu plan de Vercel** (*Settings → Billing*). Si es **Hobby**, las condiciones de Vercel solo permiten uso **personal y no comercial** ([verificado](https://vercel.com/docs/plans/hobby)). Valora pasar a Pro (20 $/mes por usuario).
- [ ] 3. **Token de GitHub** para lanzar el worker de vídeo:
  - Ruta: *GitHub → Settings → Developer settings → Fine-grained tokens*.
  - Repositorio: solo `azimut-web`. Permiso: *Actions: Read and write* y nada más.
  - Va a Vercel como `GITHUB_DISPATCH_TOKEN`.
- [ ] 4. En GitHub → repo → *Settings → Secrets and variables → Actions*, crea el secreto `VIDEO_WORKER_SECRET` con el mismo valor que en Vercel. Genéralo con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- [ ] 5. Genera también, con el mismo comando, `SOCIAL_TOKEN_ENC_KEY` y `OAUTH_STATE_SECRET`, y guárdalos **solo en Vercel**.
- [ ] 6. **Supabase:** añade `SUPABASE_SERVICE_ROLE_KEY` (*Project Settings → API*) **solo en Vercel**. Comprueba en *Authentication → Providers / Sign In* que el **registro de usuarios nuevos está desactivado** (ver el aviso de seguridad en PLAN.md).

## 5. Resumen de plazos

| Paso | Plazo | Bloquea |
|------|-------|---------|
| Handles y cuentas en todas las redes | 1 tarde | Nada; conviene hacerlo ya |
| App de Meta (acceso estándar) | Mismo día | Facebook e Instagram |
| LinkedIn, tier Development | [sin verificar] días | LinkedIn |
| LinkedIn, tier Standard | ~30 días hábiles (orientativo, no oficial) | Uso más allá de 12 meses y renovación automática del token |
| App de Google en producción | Inmediato | YouTube |
| Verificación de Google o auditoría de YouTube | Semanas [sin verificar]; solo si los vídeos quedan en privado | Visibilidad pública en YouTube |
| Google Business Profile (API) | Perfil verificado ≥ 60 días + revisión ([verificado](https://developers.google.com/my-business/content/prereqs)) | Solo la fase futura |

Mientras llegan las aprobaciones, la Fase 2 se desarrolla y se prueba entera en **dry-run**. Cada red se activa cuando su cuenta esté conectada.

## 6. Redes adicionales recomendadas (alta futura)

Las prioridades y la justificación técnica están en PLAN.md, apartado e. Lo que te toca a ti:

1. **Portales (prioridad 1):**
   - Pide a **Kyero** la especificación de su feed XML para agencias.
   - Pregunta a **Idealista** y **Fotocasa** por su alta profesional e importación automática (formato o API, coste).
   - **Rightmove Overseas** requiere una cuenta de anunciante de pago y credenciales de su Real Time Datafeed.
2. **Google Business Profile (prioridad 2):** crea y verifica ya el perfil de la empresa (dirección o área de servicio). La API exige 60 días de antigüedad, así que cuanto antes empiece a contar, mejor.
3. **Pinterest (prioridad 3):**
   - Cuenta **Business** `azimutproperty` y app en `developers.pinterest.com`.
   - Con acceso Trial, los pines solo los ves tú; para el acceso Standard piden un vídeo de la app funcionando.
4. **TikTok (prioridad 4):**
   - Cuenta Business `azimutproperty` (libre) y app en `developers.tiktok.com` con el scope `video.publish`.
   - Sin auditoría, todo se publica en **privado**.
