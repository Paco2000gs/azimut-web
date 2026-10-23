# Vídeos de propiedades (HyperFrames)

Genera un vídeo de 30 s por propiedad en dos formatos a partir de un JSON:

- `portrait` 1080×1920: Reels, TikTok, YouTube Shorts
- `landscape` 1920×1080: YouTube, web, portales

Funciona con [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache 2.0), con la versión fijada a `0.8.189`.

## Requisitos

Node 22 o superior, FFmpeg y Chrome (HyperFrames lo localiza solo).

## Uso

```bash
cd videos/property-reel
node render.mjs 19              # los dos formatos → renders/finca-jimena-19-*.mp4
node render.mjs 19 portrait     # solo uno
node build.mjs 19 && npm run dev  # vista previa en el navegador
```

`render.mjs` desactiva la telemetría de HyperFrames (`HYPERFRAMES_NO_TELEMETRY=1`). Para la vista previa, expórtala tú en la terminal.

## Nueva propiedad

1. Copia `properties/19.json` como `properties/<id>.json` y rellena los textos.
2. Pon las fotos en `assets/properties/<id>/` y referencia la principal en `photos.hero`.
3. `node render.mjs <id>`

`index.html` y `compositions/` son el resultado de `build.mjs`. Para cambiar algo, edita el JSON o el generador y vuelve a construir.

## Estructura del vídeo

| Tiempo | Escena | Contenido |
| --- | --- | --- |
| 0–4,5 s | hook | Foto a pantalla completa, ubicación y titular (ya visibles en el fotograma 0, que hace de miniatura) |
| 4,5–10,5 s | land | La foto se convierte en panel y aparecen tres cifras |
| 10,6–15 s | feature | La foto vuelve a pantalla completa con la característica estrella |
| 15,4–19,6 s | buildings | Fondo crema y superficies construidas |
| 19,8–24,6 s | location | Diagrama de distancias |
| 24,8–30 s | close | Logo, precio, opción y llamada a la acción |

## Notas

- El vídeo sale sin sonido. Para Reels y TikTok conviene añadir la música dentro de la propia app.
- Los MP4 no se guardan en git (`renders/` está ignorado). Súbelos a YouTube o Vimeo y enlázalos desde la web; Supabase Storage tiene un límite de 1 GB.
- GSAP va incluido en `assets/vendor/` para que el render no dependa de una CDN.
