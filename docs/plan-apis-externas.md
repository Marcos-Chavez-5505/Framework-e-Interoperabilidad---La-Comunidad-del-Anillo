# Plan de integración: APIs externas (Jamendo, QR Monkey, DiceBear)

Documento operativo para desarrollador o agente IA. Complementa `AGENTS.md` y `README.md`.

- **Rama:** `feature/apis-externas`
- **Estado:** spike F0 parcialmente ejecutado (ver §2). Nada de F1 en adelante está implementado.
- **Marcas:** `[AGENTE]` lo puede ejecutar un agente IA. `[HUMANO]` requiere una persona. `[VERIFICAR]` dato no confirmado, comprobar antes de usar. `[INFERIDO]` conclusión razonable que no se probó directamente.

---

## 0. Reglas de ejecución

1. Inspeccionar el estado real del repo antes de modificar (`AGENTS.md` §6). No asumir que archivos, campos o permisos existen.
2. Ejecutar las fases en orden. No pasar a la siguiente sin cumplir el criterio de aceptación.
3. Un commit por fase, con mensaje claro. Sin operaciones destructivas de Git (`reset --hard`, `clean -fd`, `push --force`).
4. No hardcodear `JAMENDO_CLIENT_ID`. Solo en `backend/.env`. `.env.example` lleva la variable vacía. No imprimirlo en logs ni en evidencia. Ojo: el campo `next` de las respuestas de Jamendo lo incluye; no guardarlo ni reenviarlo al cliente.
5. No afirmar que algo funciona sin haberlo probado. Registrar evidencia en `docs/evidencia/`.
6. Cambiar solo lo necesario. No reescribir módulos existentes. No agregar dependencias sin justificarlo.
7. Si un dato marcado `[VERIFICAR]` no coincide con la documentación oficial, seguir la documentación y anotar la diferencia.
8. El agente necesita acceso de red a `api.jamendo.com`, `api.qrcode-monkey.com` y `api.dicebear.com`. Si no lo tiene, detenerse y avisar.

## 1. Decisiones cerradas

| Tema      | Decisión                                                                                                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jamendo   | Solo seed. El catálogo fijo vive en Strapi. Sin búsqueda en vivo contra Jamendo.                                                                                                                    |
| Licencias | Se incluyen también las canciones con `license_ccurl` vacío. En ese caso la UI enlaza a la página de la canción en Jamendo como referencia de licencia. No se afirma que sean Creative Commons. |
| Géneros  | Se crean en Strapi los géneros que traiga Jamendo. La colección `Genre` crece más allá de los 3 actuales.                                                                                       |
| QR Monkey | El QR codifica el `share_url` del track (`https://www.jamendo.com/track/<id>`). Se pide a través de un endpoint proxy en Strapi.                                                                 |
| DiceBear  | Modo HTTP (`<img>`). Solo como avatar por defecto cuando el usuario no tiene avatar.                                                                                                                |
| Alcance   | Estas 3 APIs son las únicas autorizadas. No agregar otras.                                                                                                                                           |

Justificación del endpoint custom de QR (exigida por `AGENTS.md` §11): QR Monkey responde siempre `access-control-allow-origin: https://www.qrcode-monkey.com`, también cuando la petición declara `Origin: http://localhost:5173`. Un `fetch` desde el navegador queda bloqueado `[INFERIDO]`. Existía la alternativa de un `<img>` con GET (el endpoint lo permite y devolvió el mismo PNG), pero se eligió el proxy por control de errores, caché y posibilidad de cambiar de proveedor sin tocar el front.

## 2. Resultados del spike F0 ya obtenidos (2026-10-19)

Probados manualmente con Postman. Guardar estos resultados en `docs/evidencia/f0-resultados.md` (F0.2).

| Prueba                                      | Resultado                                                                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jamendo `/v3.0/tracks/` sin `client_id` | HTTP 200 con `status: failed`, `code: 5`, error de credencial no autorizada. **El `client_id` es obligatorio.**                                                     |
| Jamendo con `client_id`                   | `status: success`, 5 resultados. Header `access-control-allow-origin: *`.                                                                                                   |
| Audio (URL con token `from=`)             | HTTP 206 con `Range`, `content-type: audio/mpeg`, tamaño total 1.994.240 bytes. La URL original tenía aproximadamente 1 mes y seguía funcionando (una canción probada). |
| QR Monkey POST `/qr/custom`               | PNG válido. Escaneado con celular: abre la canción en Jamendo. Sin credenciales.                                                                                              |
| QR Monkey GET `/qr/custom`                | Mismo PNG.                                                                                                                                                                      |
| QR Monkey CORS                              | `access-control-allow-origin` fijo en `https://www.qrcode-monkey.com`, también con `Origin: http://localhost:5173`.                                                      |
| DiceBear `/10.x/thumbs/svg?seed=1`        | SVG válido.                                                                                                                                                                    |

**Campos reales de Jamendo (un track de ejemplo):** `id`, `name`, `duration` (segundos), `artist_id`, `artist_name`, `artist_idstr`, `album_id`, `album_name`, `license_ccurl` (**vacío en este track**), `position`, `releasedate`, `album_image`, `image`, `audio`, `audiodownload`, `prourl`, `shorturl`, `shareurl`, `audiodownload_allowed`, `content_id_free`, `musicinfo.tags.genres` (array con varios géneros), `musicinfo.tags.instruments`, `musicinfo.tags.vartags`.

**Riesgos abiertos de F0:**

- CORS de QR Monkey no se probó en un navegador real (solo en Postman).
- No se sabe si el token `from=` depende del track o de la llamada. Prueba opcional `[HUMANO]`: repetir la misma request y comparar el `from` del mismo track.
- La documentación oficial de QR Monkey presenta la API como accesible por RapidAPI. El endpoint abierto funciona hoy, pero podría cambiar o limitarse sin aviso.

### F0.1 `[AGENTE]` Actualizar documentación de alcance

- Archivos: `AGENTS.md` (§2 restricción crítica, §11, §18) y `README.md` (frase "No se implementa interoperabilidad con sistemas externos").
- Agregar una excepción explícita: se autorizan exactamente Jamendo, QR Monkey y DiceBear, y un endpoint proxy en Strapi para QR Monkey. Cualquier otro servicio sigue prohibido.
- Mantener el resto del texto sin cambios.

### F0.2 `[AGENTE]` Registrar evidencia

- Crear `docs/evidencia/f0-resultados.md` con la tabla de arriba.
- Guardar un track de ejemplo de Jamendo en `docs/evidencia/jamendo-track-ejemplo.json`, con `client_id` y campo `next` eliminados.

### F0.3 `[HUMANO]` Credencial de Jamendo

- Usar el `client_id` de una aplicación propia del TP, o el de otra app solo con acuerdo de su titular. Los términos de Jamendo piden una cuenta por persona y que el titular proteja sus credenciales. Compartirlo solo por canal privado.
- Cargarlo en `backend/.env` como `JAMENDO_CLIENT_ID`.

**Criterio de aceptación:** documentación de alcance actualizada y evidencia guardada sin credenciales.
**Commit:** `docs: autorizar APIs externas y registrar spike`

---

## F1. Modelo en Strapi

**Archivos:** `backend/src/api/track/content-types/track/schema.json`, `backend/.env.example`, `backend/.env` (local).

1. Agregar a `Track`: `jamendo_id` (string, único), `license_url` (string, opcional), `share_url` (string).
2. Verificar el tipo actual de `cover`. Si es media, cambiarlo a string (URL) para admitir portadas remotas. Si ya es string, no tocar.
3. Verificar la cardinalidad de la relación `Track` → `Genre` (una sola o varias). Condiciona F2.
4. Agregar `JAMENDO_CLIENT_ID=` (vacío) a `.env.example`.
5. No borrar los campos existentes.

**Criterio de aceptación:** Strapi arranca (`npm run develop`) y el Admin muestra los campos nuevos.
**Commit:** `feat(backend): campos Jamendo en Track`

---

## F2. Seed de Jamendo

**Archivos:** `backend/scripts/seed-jamendo.js` (nuevo), `backend/package.json` (script `seed:jamendo`). Leer primero `backend/scripts/seed.js` para reutilizar su estilo y su lógica de permisos.

1. Leer `JAMENDO_CLIENT_ID` desde el entorno. Si falta, abortar con mensaje claro.
2. Pedir entre 40 y 60 canciones a Jamendo, con variedad de géneros (al menos 5). Para variar, consultar por varios tags `[VERIFICAR]` en la documentación de `/v3.0/tracks` (`tags`, `fuzzytags`, `order`, `track_type`). Usar `audioformat=mp32` e `include=musicinfo`.
3. Mapear a Strapi:
   - `id` → `jamendo_id`
   - `name` → `title`
   - `duration` → `duration` (segundos; verificar la unidad del campo actual)
   - `audio` → `audio_url`
   - `image` → `cover`
   - `releasedate` → `release_date`
   - `shareurl` → `share_url`
   - `license_ccurl` → `license_url` (puede venir vacío; guardar vacío, no inventar)
   - `artist_name` → `Artist` (crear si no existe)
   - `album_name` → `Album` (crear si no existe)
   - `musicinfo.tags.genres` → `Genre` (crear los que no existan). Si la relación admite un solo género, usar el primero del array. Si el array viene vacío, dejar el género sin asignar.
4. Idempotencia: upsert por `jamendo_id` con `documentService`. Verificar contra el uso de `documentService` en `seed.js`. Volver a ejecutar el seed refresca también `audio_url`.
5. **Conflicto con el seed original:** `seed.js` vacía y recrea las colecciones de música. Ejecutarlo después de `seed:jamendo` borraría el catálogo de Jamendo. Antes de tocarlo, preguntar cómo proceder. Propuesta: dejar en `seed.js` solo la concesión de permisos y quitar la parte de música. No eliminar los tracks locales antiguos sin confirmación.
6. Conservar la concesión de permisos REST al rol Authenticated para Módulos 3 y 4. Mantenerla en `seed.js` o reutilizarla; no perderla.
7. Omitir pistas sin `audio` utilizable.
8. Plan B si las URLs de audio caducan: guardar solo `jamendo_id` y refrescar `audio_url` bajo demanda. Decidir con el equipo antes de implementarlo.

**Criterio de aceptación:**

- `npm run seed:jamendo` corre dos veces sin duplicar.
- `GET /api/tracks?populate=*` devuelve los datos completos con rol Authenticated.
- El selector de género y la búsqueda de `/musica` siguen funcionando con los géneros nuevos.

**Evidencia:** captura del resultado y conteo de tracks y géneros.
**Commit:** `feat(backend): seed de catálogo desde Jamendo`

---

## F3. Player y atribución

**Archivos:** componentes del Player/`PlayerBar` y de la Biblioteca (localizarlos primero).

1. Probar que el Player reproduce `audio_url` remota sin cambios: play/pausa, siguiente/anterior, aleatorio, repetir y barra de progreso. Corregir solo si falla.
2. Mostrar atribución en `PlayerBar` y en la Biblioteca: "Música: Jamendo" y nombre del artista.
3. Licencia por canción:
   - Si `license_url` tiene valor: enlazarlo como "Licencia".
   - Si está vacío: mostrar "Ver licencia en Jamendo" enlazando a `share_url`. No afirmar que la canción es Creative Commons.
4. Solo después de confirmar que todo reproduce, quitar `backend/public/audio` y `backend/public/covers` del repo y revisar `config/plugins.js` (permiso `audio/*`). Preguntar antes de borrar archivos.

**Criterio de aceptación:** reproducción completa de al menos 5 canciones distintas, atribución visible y enlace de licencia correcto en un track con licencia y en uno sin ella.
**Commit:** `feat(frontend): reproducción desde Jamendo y atribución`

---

## F4. QR Monkey vía proxy en Strapi

**Backend — archivos:** ruta custom del content-type `Track` (por ejemplo `backend/src/api/track/routes/`), controlador y servicio de `Track`. Seguir las convenciones de `backend/src/api/follow/`.

1. Ruta `GET /api/tracks/:documentId/qr`, autenticada (rol Authenticated). Verificar que la ruta custom se cargue antes que las rutas core de `Track` para que no haya conflicto `[VERIFICAR]` (en Strapi los archivos de rutas se cargan por orden alfabético).
2. El handler busca el track, toma su `share_url` y llama a `POST https://api.qrcode-monkey.com/qr/custom` con:
   - `data`: el `share_url`
   - `size`: 300
   - `file`: `png`
   - `config.bodyColor`: el acento pink del tema (tomarlo de `frontend/src/index.css`; en las pruebas se usó `#E91E63`)
   - `config.bgColor`: `#FFFFFF`
3. Responder el binario con `Content-Type: image/png`. Si QR Monkey falla o tarda, responder 502 con mensaje claro y un tiempo de espera definido.
4. Caché en memoria por `documentId` para no repetir llamadas.
5. Usar el `fetch` global de Node si la versión lo permite `[VERIFICAR]`. No agregar dependencias.
6. Si el track no tiene `share_url`, responder 404 con mensaje claro.
7. Conceder el permiso del nuevo action al rol Authenticated (en el seed o donde corresponda) `[VERIFICAR]` el nombre del permiso, probablemente `api::track.track.qr`.

**Frontend — archivos:** `frontend/src/api/qr.js` (nuevo), `frontend/src/components/QrModal.jsx` (nuevo), `PlayerBar`.

1. Pedir el QR con axios y `responseType: 'blob'`, adjuntando el JWT. No usar `<img src>` directo, porque el JWT va en un header. Convertir con `URL.createObjectURL` y liberar con `revokeObjectURL`.
2. Botón "QR" en `PlayerBar`. Al pulsar, abre un modal (marcado Bootstrap/AdminKit) con la imagen.
3. Estados: cargando, error con botón de reintento, botón deshabilitado si la canción no tiene `share_url`.
4. Caché en memoria por `documentId`.

**Criterio de aceptación:** el QR se genera al pulsar, se ve el estado de carga y de error (probar apagando la red), y escaneado abre la canción en Jamendo.
**Evidencia:** captura del modal, del resultado del escaneo y de la respuesta del endpoint.
**Commit:** `feat: QR de la canción con QR Monkey vía proxy`

---

## F5. DiceBear

**Archivos:** `frontend/src/utils/avatarUrl.js` (nuevo), `AppLayout.jsx`, `Perfil`, `BuscarPersonas`. Localizar todos los usos actuales de `avatar`.

1. Helper `avatarUrl(user)`: si `user.avatar` tiene valor, devolverlo. Si no, devolver `https://api.dicebear.com/10.x/thumbs/svg?seed=<id>` con el `id` codificado.
2. Usar el `id` del usuario como semilla, no el `username` (es editable y cambiaría el avatar).
3. Fijar versión y estilo en constantes.
4. Usar el helper en el navbar, en `/perfil` y en `/personas`.
5. `onerror` del `<img>` con un avatar local de respaldo, porque el servicio no garantiza disponibilidad.
6. No cambiar el flujo de edición de `avatar` en `PUT /api/user/me`.

**Criterio de aceptación:**

- Usuario sin avatar muestra uno generado y estable entre recargas.
- Usuario con URL propia muestra la suya.
- Con `api.dicebear.com` bloqueado aparece el respaldo.

**Commit:** `feat(frontend): avatar por defecto con DiceBear`

---

## F6. Documentación

1. `README.md`: sección "APIs externas" con el flujo, la variable `JAMENDO_CLIENT_ID`, el comando `npm run seed:jamendo`, el endpoint de QR y las limitaciones.
2. Documentar los cambios al template AdminKit (modal del QR) como pide `AGENTS.md` §10.
3. Registrar en el informe: dependencias agregadas (idealmente ninguna), problemas encontrados, la decisión de proxy con su justificación CORS y conclusiones.

**Commit:** `docs: documentar integración de APIs externas`

---

## 3. Flujo resultante

```text
[seed-jamendo.js] --GET--> Jamendo API --> Strapi (Track)      (una vez, en desarrollo)
React --REST--> Strapi                                          (runtime)
<audio> --stream--> storage de Jamendo                          (runtime)
Botón QR --REST--> Strapi --POST--> QR Monkey --> PNG           (runtime, a demanda)
<img> --GET--> DiceBear                                         (runtime, si no hay avatar)
```

Jamendo no es API de runtime: se consulta solo al sembrar. La app sí depende de Jamendo para el audio, porque `audio_url` apunta a su storage. Documentarlo así en el informe.

## 4. Riesgos

| Problema                               | Causa                                                                         | Mitigación                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| El audio deja de sonar                 | URL con token de Jamendo, sin garantía de permanencia                        | Volver a correr el seed refresca las URLs; plan B en F2.8                                |
| Caída de Jamendo                      | El audio no es local                                                          | Documentarlo como limitación; video de respaldo para la demo                            |
| Licencia vacía en parte del catálogo | `license_ccurl` no siempre viene completo                                   | La UI enlaza a Jamendo y no afirma licencia CC                                           |
| QR Monkey cambia o se limita           | La documentación lo presenta vía RapidAPI; el endpoint abierto funciona hoy | Proxy aísla el cambio; el cambio se limita a un archivo del backend                     |
| `client_id` filtrado                 | Aparece en el campo `next` y en `.env`                                    | Verificar `.gitignore`; no reenviar `next`; solo variable vacía en `.env.example` |
| El seed original borra el catálogo    | `seed.js` vacía las colecciones de música                                 | Separar permisos de música en F2.5                                                      |
| Uso comercial                          | Los términos de Jamendo cubren solo uso no comercial                         | Sin publicidad ni monetización                                                          |
| Cuota de Jamendo                       | Plan gratuito con tope mensual                                                | El seed usa pocas requests; no hay llamadas en runtime                                   |
| Avatar roto                            | DiceBear sin garantía de disponibilidad                                      | `onerror` con respaldo local                                                           |

## 5. Fuera de alcance

- Búsqueda de canciones en vivo contra Jamendo.
- Descarga de audio (`audiodownload`).
- Selección de estilo de avatar por el usuario.
- TheColorAPI u otras APIs adicionales.
- Cambios de base de datos, GraphQL o microservicios.

## 6. Checklist final

- [ ] `AGENTS.md` y `README.md` actualizados con la excepción de alcance
- [ ] Evidencia de F0 en `docs/evidencia/` sin credenciales
- [ ] Campos nuevos en `Track`
- [ ] `npm run seed:jamendo` idempotente, con géneros creados desde Jamendo
- [ ] `seed.js` ya no borra el catálogo de Jamendo y conserva los permisos
- [ ] Player reproduce audio remoto y muestra atribución, con y sin `license_url`
- [ ] Endpoint de QR autenticado y botón con estados de carga y error
- [ ] QR escaneado y verificado
- [ ] Avatar por defecto con respaldo
- [ ] `.env` fuera de Git y `.env.example` sin secretos
- [ ] Un commit por fase en `feature/apis-externas`

## 7. Referencias

- Jamendo API: `https://developer.jamendo.com/v3.0/tracks` y `https://devportal.jamendo.com/api_terms_of_use`
- QR Monkey API: `https://www.qrcode-monkey.com/qr-code-api-with-logo/`
- DiceBear HTTP API: `https://www.dicebear.com/how-to-use/http-api/`
