# F0 — Evidencia del spike de APIs externas

Fecha de las pruebas: 2026-10-19.
Método: pruebas manuales con Postman.
Sin credenciales en este documento.

Este archivo registra los resultados del spike F0 del plan (`docs/plan-apis-externas.md`, §2). Nada de F1 en adelante está implementado al momento de este registro.

## Tabla de resultados

| Prueba                               | Resultado                                                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jamendo `/v3.0/tracks/` sin `client_id` | HTTP 200 con `status: failed`, `code: 5`, error de credencial no autorizada. **El `client_id` es obligatorio.**                                                     |
| Jamendo con `client_id`             | `status: success`, 5 resultados. Header `access-control-allow-origin: *`.                                                                                                   |
| Audio (URL con token `from=`)       | HTTP 206 con `Range`, `content-type: audio/mpeg`, tamaño total 1.994.240 bytes. La URL original tenía aproximadamente 1 mes y seguía funcionando (una canción probada). |
| QR Monkey POST `/qr/custom`         | PNG válido. Escaneado con celular: abre la canción en Jamendo. Sin credenciales.                                                                                              |
| QR Monkey GET `/qr/custom`          | Mismo PNG.                                                                                                                                                                      |
| QR Monkey CORS                      | `access-control-allow-origin` fijo en `https://www.qrcode-monkey.com`, también con `Origin: http://localhost:5173`.                                                      |
| DiceBear `/10.x/thumbs/svg?seed=1`  | SVG válido.                                                                                                                                                                    |

## Campos reales de un track de Jamendo

`id`, `name`, `duration` (segundos), `artist_id`, `artist_name`, `artist_idstr`, `album_id`, `album_name`, `license_ccurl` (**vacío en este track**), `position`, `releasedate`, `album_image`, `image`, `audio`, `audiodownload`, `prourl`, `shorturl`, `shareurl`, `audiodownload_allowed`, `content_id_free`, `musicinfo.tags.genres` (array con varios géneros), `musicinfo.tags.instruments`, `musicinfo.tags.vartags`.

Ver `docs/evidencia/jamendo-track-ejemplo.json` para un ejemplo con esta estructura.

## Riesgos abiertos de F0

- CORS de QR Monkey no se probó en un navegador real (solo en Postman).
- No se sabe si el token `from=` depende del track o de la llamada. Prueba opcional `[HUMANO]`: repetir la misma request y comparar el `from` del mismo track.
- La documentación oficial de QR Monkey presenta la API como accesible por RapidAPI. El endpoint abierto funciona hoy, pero podría cambiar o limitarse sin aviso.

## Notas de alcance

- `client_id` obligatorio: sin él, la API responde HTTP 200 con `status: failed` y `code: 5`.
- El `client_id` no se registra en esta evidencia ni en ningún archivo versionado.
- El campo `next` de las respuestas de Jamendo puede contener el `client_id`; no se guarda ni se reenvía al cliente.
