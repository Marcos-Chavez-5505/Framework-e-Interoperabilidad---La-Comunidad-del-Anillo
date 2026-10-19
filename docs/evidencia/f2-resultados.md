# F2 — Seed de catálogo desde Jamendo

Fecha: 2026-10-18.
Comando: `cd backend && npm run seed:jamendo`.
Sin credenciales en este documento.

## Resultado (catálogo fijo: `backend/data/jamendo-seed-ids.json`, 70 ids)

Primera corrida con manifest:

```text
Catálogo fijo: 70 ids (data/jamendo-seed-ids.json)
  Coincidencias en esta consulta: 50
Seed Jamendo completado:
  Tracks procesados : 50 (creados: 0, actualizados: 50)
  Géneros evaluados : 8
  Total tracks      : 74
  Total géneros     : 14
```

Segunda corrida con manifest:

```text
Catálogo fijo: 70 ids (data/jamendo-seed-ids.json)
  Coincidencias en esta consulta: 40
Seed Jamendo completado:
  Tracks procesados : 40 (creados: 0, actualizados: 40)
  Géneros evaluados : 7
  Total tracks      : 74
  Total géneros     : 14
```

**Idempotente:** ninguna corrida posterior crea tracks (creados: 0) y el total se mantiene en 74.

## Conteo en la BD local

- Tracks totales: **74** = 4 locales (reproductor original, `jamendo_id` NULL) + **70 de Jamendo**.
- Géneros: **14** = 3 locales + **11 de Jamendo** (classical, electronic, electronica, electrorock, hiphop, house, jazz, pop, rap, rock, world).
- Campos poblados por track: `jamendo_id`, `title`, `duration` (segundos), `audio_url`, `cover`, `release_date`, `license_url` (vacío cuando Jamendo no lo trae), `share_url`.

## Verificación REST (rol Authenticated)

Sobre una copia de la BD (`DATABASE_FILENAME=.tmp/verify-f2.db`, puerto 1338):

| Prueba                                   | Resultado                                    |
| ---------------------------------------- | -------------------------------------------- |
| `GET /api/tracks?populate=*` con JWT     | HTTP 200, `total = 74`                       |
| Campos nuevos en la respuesta            | `jamendo_id`, `license_url`, `share_url` presentes |
| `GET /api/genres`                        | HTTP 200, `total = 14`                       |
| `GET /api/tracks` sin JWT (rol Public)   | HTTP 403 (gate de permisos funcionando)      |

## Hallazgo: Jamendo es no determinista

El primer enfoque (consultar solo por tags) **no produce un catálogo fijo**:

1. Dos consultas idénticas por tags devuelven conjuntos distintos (la 1ª dio 50 tracks únicos; la 2ª, 40 con 20 nuevos).
2. El parámetro `id` de Jamendo:
   - Admite **máximo 50 valores** por request (`code 3` con más).
   - Es **todo o nada**: un `id` sin resultado anula el lote completo (0 resultados).
   - Es **no confiable**: el mismo `id` devolvió 1 resultado y luego 0.

## Decisión de implementación

Para cumplir "catálogo fijo" e idempotencia se usa un **manifest de ids** (`backend/data/jamendo-seed-ids.json`):

1. Sin manifest: se consulta Jamendo por tags (7 géneros), se eligen hasta 50 tracks y se **congela** el listado en el manifest.
2. Con manifest: se consulta Jamendo por tags y se actualizan **solo** los tracks cuyo `jamendo_id` está en el manifest. Nunca se crean tracks fuera del manifest.

No se usa el parámetro `id` (por los problemas de la sección anterior).

**Limitación:** el refresco de `audio_url` es *best-effort*: solo se actualizan los ids del manifest que Jamendo devuelve en cada consulta por tags. Si una URL de audio caduca, puede requerir más de una corrida o el plan B de F2.8.

## Actualización posterior (F2.5 y F3.4)

- **F2.5 (resuelto):** `backend/scripts/seed.js` quedó solo con la concesión de permisos al rol Authenticated; ya no vacía ni recrea las colecciones de música.
- **F3.4 (resuelto):** se eliminaron los 4 tracks locales (`jamendo_id` NULL) y sus assets (`backend/public/audio`, `backend/public/covers`). Estado actual: **70 tracks, 0 locales, 14 géneros**.
