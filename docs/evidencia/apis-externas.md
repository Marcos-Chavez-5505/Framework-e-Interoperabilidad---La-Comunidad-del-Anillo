# Evidencia — integración de APIs externas (Jamendo, QR Monkey, DiceBear)

Fecha: 2026-10-19.
Sin credenciales en este documento.

## Alcance

Se integraron **solo** los tres servicios autorizados (`AGENTS.md` §2):

| Servicio  | Uso                                      | Dónde                                  |
| --------- | ---------------------------------------- | -------------------------------------- |
| Jamendo   | Seed puntual del catálogo (no runtime)   | `backend/scripts/seed-jamendo.js`      |
| QR Monkey | QR de la canción, vía proxy en Strapi    | `backend/src/api/track/*`, `QrModal`   |
| DiceBear  | Avatar por defecto si no hay uno propio  | `frontend/src/utils/avatarUrl.js`      |

No se agregaron otros servicios, microservicios ni GraphQL.

## Estado por fase

| Fase | Resultado verificado                                                                 |
| ---- | ------------------------------------------------------------------------------------ |
| F0   | Spike de Jamendo y decisión de arquitectura documentados                             |
| F2   | Seed idempotente con manifest de 70 ids (2 corridas: creados 0, total estable)       |
| F2.5 | `seed.js` solo otorga permisos; ya no vacía ni recrea el catálogo                    |
| F3   | Audio remoto con `<audio>` y streaming; atribución con y sin `license_url`           |
| F3.4 | Eliminados los 4 tracks locales y sus assets (`public/audio`, `public/covers`)       |
| F4   | `GET /api/tracks/:documentId/qr` autenticado, con caché, timeout y errores claros    |
| F5   | Avatar DiceBear estable (semilla = `id`) con respaldo local                          |

## Conteo actual de la base local

| Dato                              | Valor |
| --------------------------------- | ----- |
| Tracks totales                    | 70    |
| Tracks locales (`jamendo_id` NULL) | 0     |
| Géneros                           | 14    |
| Permiso `api::track.track.qr`     | 1 (rol Authenticated) |

## Verificaciones ejecutadas

Sobre copia de la BD y puerto 1338 (para no tocar la instancia de desarrollo):

| Prueba                                          | Resultado                                              |
| ----------------------------------------------- | ------------------------------------------------------ |
| `GET /api/tracks?populate=*` con JWT            | 200, total 74 (al momento de F2; luego 70 tras F3.4)   |
| Campos `jamendo_id`, `license_url`, `share_url` | Presentes en la respuesta                              |
| `GET /api/genres`                               | 200, total 14                                          |
| `GET /api/tracks` sin JWT                       | 403                                                    |
| Audio del track Jamendo                         | 206, `audio/mpeg`, `content-range` total 5431999, CORS |
| `GET /api/tracks/:id/qr`                        | 200, `image/png`, PNG de 1981 bytes                    |
| Segunda llamada al QR                           | 7 ms (caché en memoria)                                |
| QR de track sin `share_url`                     | 404 con mensaje claro                                  |
| QR de `documentId` inexistente                  | 404 con mensaje claro                                  |
| QR sin JWT                                      | 403                                                    |
| DiceBear (`seed=1`, dos llamadas)               | 200, `image/svg+xml`, SVG válido, bytes idénticos      |
| Helper de avatar                                | URL propia (trim) / DiceBear con `id` / seed por username si no hay `id` |
| `npm run lint` y `npm run build` (frontend)     | OK                                                     |

El usuario confirmó el funcionamiento en el navegador antes de F6.

## Dependencias agregadas

**Ninguna.** Se usó:

- `fetch` global de Node para el proxy a QR Monkey.
- `axios` (ya presente) para pedir el PNG como `blob`.
- `<img>` plano para DiceBear.

## Problemas encontrados

1. **Jamendo es no determinista.** Consultar solo por tags devuelve conjuntos distintos entre corridas. El parámetro `id` admite máximo 50 valores, es "todo o nada" y no confiable. Solución: manifest fijo de ids y upsert solo de esos ids.
2. **El reproductor precargaba el audio completo como blob.** Eso producía una condición de carrera al cambiar rápido de canción. Solución: streaming progresivo (`audio.src = audio_url` + `load()`), abortando la carga previa.
3. **QR Monkey no permite CORS desde el navegador.** Su CORS está fijado a `https://www.qrcode-monkey.com`. Solución: proxy autenticado en Strapi.
4. **`license_ccurl` no siempre viene completo.** Si falta, la UI enlaza a la página del track en Jamendo y no afirma licencia Creative Commons.
5. **Ícono QR del template.** El SVG original traía colores fijos (`#121331`/`#fff`); se recoloreó a `currentColor`/`none` para que herede el tema.
6. **`seed.js` original borraba el catálogo.** Se separó: permisos (`seed.js`) y catálogo (`seed:jamendo`).
7. **Tracks históricos sin metadatos de Jamendo.** La BD real tenía 70 tracks creados por una versión anterior del seed, con `jamendo_id`, `share_url` y `license_url` vacíos; por eso el botón QR quedaba deshabilitado. Solución: `seed:jamendo` ahora backfillea `jamendo_id` y `share_url` derivándolos del `trackid` de `audio_url`, sin duplicar. Verificado sobre copia: backfill 70, creados 0, total 70. La BD real quedó reparada (70/70 con `share_url`).

## Decisión del proxy QR y justificación CORS

El QR se genera **en el backend**, no en el navegador, porque QR Monkey no permite solicitudes desde un origen distinto al suyo (CORS). Un proxy en Strapi:

- Evita exponer la lógica de QR Monkey al frontend.
- Permite exigir JWT (el usuario debe estar autenticado).
- Centraliza caché, timeout y traducción de errores en un solo archivo.
- Aísla a la app de cambios o límites del endpoint externo.

## Limitaciones

- El audio depende de Jamendo en *runtime*: `audio_url` lleva token y puede caducar. Volver a correr `npm run seed:jamendo` refresca las URLs (best-effort).
- Si Jamendo no responde, el audio no suena; el resto de la app sigue funcionando.
- QR Monkey se documenta vía RapidAPI y el endpoint abierto puede cambiar o limitarse.
- DiceBear no garantiza disponibilidad; siempre hay respaldo local.
- Uso académico/no comercial, acorde a los términos de Jamendo.

## Conclusiones para el informe

- La integración de APIs externas se resolvió **sin dependencias nuevas**, apoyándose en `fetch`, `axios` y elementos nativos del navegador.
- Strapi cubrió bien los dos roles necesarios: **origen de datos** (catálogo) y **proxy seguro** (QR con JWT).
- React solo consume REST; no se agregó una capa de API intermedia.
- El costo principal es el **acoplamiento externo del audio**, asumido y documentado; es aceptable para una prueba de concepto.
- La separación entre seed de permisos y seed de catálogo evita que una tarea destructiva borre los datos de la demo.
