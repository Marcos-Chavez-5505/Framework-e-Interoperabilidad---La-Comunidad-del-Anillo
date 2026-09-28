# La Comunidad del Anillo — TP2 Frameworks e Interoperabilidad

Prueba de concepto académica que evalúa el uso conjunto de:

- **Strapi v5** como CMS (backend, REST API).
- **React 19 + Vite** como framework frontend.
- **AdminKit** como template CSS/JS basado en **Bootstrap 5**.

Dominio: aplicación conceptual similar a un *Spotify colaborativo* organizada en cuatro módulos demostrables:

1. **Autenticación de usuarios** (Módulo 1).
2. **Búsqueda de usuarios** (Módulo 2).
   1. ***Follow y Unfollow de usuarios***
3. **Reproductor de música** (Módulo 3).
4. **Búsqueda de canciones** (Módulo 4).

> No es una aplicación de producción: prioriza simplicidad, claridad didáctica y evidencia demostrable.

---

## Stack

| Capa     | Tecnología                                             |
| -------- | ------------------------------------------------------- |
| Backend  | Strapi 5.55, Node.js, SQLite (`better-sqlite3`), REST |
| Frontend | React 19.2.8, Vite 8, React Router 7, Axios             |
| UI       | AdminKit 3.5 (Bootstrap 5)                              |

Se usa exclusivamente **REST** (sin GraphQL). No se implementa interoperabilidad con sistemas externos.

---

## Estructura del repositorio

```text
/
├── backend/                    # Strapi 5 (REST + SQLite)
│   ├── config/                 # database (SQLite), plugins (audio/*), etc.
│   ├── src/api/follow/         # Content-type Follow (mod. 1)
│   ├── src/extensions/users-permissions/strapi-server.js  # bio, avatar, PUT /user/me
│   └── .env.example            # .env debe crearse localmente (no se versiona)
└── frontend/                   # React + Vite + AdminKit
    └── src/
        ├── api/strapi.js       # Cliente axios (JWT desde localStorage)
        ├── auth/               # AuthProvider, useAuth, PrivateRoute
        ├── layout/AppLayout.jsx# Layout AdminKit (sidebar + navbar)
        └── pages/              # Login, Register, Perfil, BuscarPersonas, Inicio
```

---

## Puesta en marcha

### 1. Backend (Strapi)

```bash
cd backend
cp .env.example .env     # Windows: copy .env.example .env
npm install
npm run develop           # http://localhost:1337  (Admin UI: /admin)
```

`backend/.env` **no se versiona** (está en `.gitignore`). Cada integrante debe crearlo localmente con sus claves. La base de datos es **SQLite** (archivo `backend/.tmp/data.db`, también ignorado y creado al primer arranque).

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

> Opcional: `frontend/.env` con `VITE_API_URL` para apuntar a otra URL de API (por defecto `http://localhost:1337/api`).

---

## Configuración necesaria en el Admin UI (IMPORTANTE)

Los content-types y permisos **de código** (Follow, campos `bio`/`avatar`, ruta `PUT /user/me`) se propagan automáticamente al arrancar Strapi.

Las **concesiones de permisos** realizadas desde el Admin UI se guardan en la base de datos local (`backend/.tmp/data.db`) y **no viajan por git**. Cada integrante debe replicarlas una vez:

### Checklist — rol "Authenticated" (Configuración → Usuarios y permisos → Roles → Authenticated)

**Módulo 1 — Autenticación** (`plugin::users-permissions.user`):

- [ ] `updateMe` (edición del propio perfil, `PUT /api/user/me`)
- [ ] `findOne` (consulta del usuario actual)

**Módulo 2 — Búsqueda de usuarios** (`plugin::users-permissions.user`):

- [ ] `find` (búsqueda por username y validación de relaciones)
- [ ] `count`

**Módulo 2.1 — Follow** (`api::follow.follow`):

- [ ] `create`
- [ ] `delete`
- [ ] `find`
- [ ] `findOne`

**Módulos 3 y 4 — Música** (`api::track.track`, `api::album.album`, `api::artist.artist`, `api::genre.genre`):

- [ ] `find`
- [ ] `findOne`

> Si falta `find` sobre el destinatario de una relación, Strapi v5 responde `400 Invalid key ...` (validación `throwRestrictedRelations`); es un comportamiento esperado, no un bug.

---

## Módulo 1 — Autenticación

Objetivo: registrar, iniciar sesión, cerrar sesión, consultar y editar el propio perfil.

1. Registrar un usuario (`/register`) → `POST /api/auth/local/register`.
2. Iniciar sesión (`/login`) → `POST /api/auth/local`; el JWT se guarda en `localStorage` y se adjunta a cada request por axios.
3. Al entrar, `GET /api/users/me` alimenta el estado global de sesión (`AuthProvider`).
4. En `/perfil` se editan `username`, `bio` y URL de `avatar` (`PUT /api/user/me`).

Endpoints nativos de Strapi: `POST /api/auth/local/register`, `POST /api/auth/local`, `GET /api/users/me`. Endpoint personalizado mínimo: `PUT /api/user/me` (Strapi v5 no expone la edición del propio perfil por vía nativa).

## Módulo 2 — Búsqueda de usuarios y Follow/Unfollow

Objetivo: encontrar personas por nombre de usuario y seguirlas / dejar de seguirlas.

1. En `/personas` escribir un nombre de usuario → `GET /api/users` con filtro `username $contains` (búsqueda nativa de Strapi).
2. El resultado oculta al propio usuario y muestra su estado de seguimiento (cargado con `GET /api/follows`).
3. **Seguir** → `POST /api/follows` con `{ data: { following: <id> } }`: el `follower` se asigna desde la sesión en el controlador.
4. **Dejar de seguir** → `DELETE /api/follows/:documentId`.

Reglas del content-type `Follow`: no se puede seguirse a uno mismo y no se permiten duplicados (ver `backend/src/api/follow/controllers/follow.js` y `services/follow.js`).

## Módulo 3 — Reproductor de música

Objetivo: reproducir canciones con play/pause, siguiente/anterior, modo aleatorio, repetición y barra de progreso.

1. Sembrar la biblioteca: `cd backend && node scripts/seed.js` (idempotente: si ya hay tracks, omite). Crea 5 géneros, 5 artistas, 4 álbumes y 10 tracks.
2. En `/musica` (Biblioteca), tocar una canción: entra en la cola y aparece la barra fija (`PlayerBar`) con los controles.
3. Probar play/pause, siguiente/anterior, modo aleatorio, repetición y barra de progreso.

El script usa `documentService` de Strapi (crea entradas sin pasar por permisos REST) y datos temáticos: `audio_url` con MP3 públicos estables (SoundHelix) como placeholder —para usar Jamendo solo hay que reemplazar los `audio_url` en `backend/scripts/seed.js`— y `cover` de picsum.photos.

Decisiones del módulo: reproducción con **HTML5 `<audio>`** (sin librerías extra), URLs de audio **externas** guardadas en Strapi (sin integrar la API de Jamendo en runtime), estado con **Context API** y barra fija dentro del layout. Los content-types **Track/Album/Artist/Genre** usan rutas REST estándar de Strapi.

## Módulo 4 — Búsqueda de canciones

Objetivo: buscar canciones por título o artista y filtrarlas por género.

1. En `/musica` (Biblioteca) escribir en el buscador → `GET /api/tracks` con filtro `$or` sobre `title` y `artist.name` (`$contains`).
2. Filtrar por género con el selector → filtro `genre.id $eq`.
3. Los resultados se muestran ordenados (sort `title:asc`) con `populate` de artist/album/genre y permiten iniciar la reproducción (comparte la pantalla con el Módulo 2).

La búsqueda y el filtrado se resuelven con `filters` y `populate` **nativos** de Strapi, sin endpoints personalizados.

### Nota sobre sesiones (error "Missing or invalid credentials")

Si el navegador conserva un JWT emitido con un `JWT_SECRET` distinto (o inválido), todas las rutas protegidas devuelven `401` y la app muestra ese mensaje. Desde ahora, el interceptor de axios (`frontend/src/api/strapi.js`) detecta el `401`, limpia `localStorage` y redirige a `/login`; solo hay que volver a iniciar sesión.

---

## Integración de AdminKit (evidencia para el informe)

- Estado original: template AdminKit `@adminkit/core` importado tal cual (CSS `app.css` + JS `app.js`).
- Adaptación: el layout reconstruye la estructura HTML de AdminKit (`.wrapper`, `.sidebar`, `.navbar`, `.content`, `.footer`) dentro de componentes React en `frontend/src/layout/AppLayout.jsx`.
- Los íconos *(feather)* vienen embebidos en `app.js` del template; se reemplazan con `window.feather.replace()` vía `src/hooks/useFeather.js`.
- El CSS del template de Vite (`index.css` original) se reemplazó por un reset mínimo al que se suman los overrides del tema (paleta oscura + acento pink) desde `frontend/src/index.css`, importado **después** de `app.css` para ganar en cascada.

---

## Portafolio de ramas / commits

| Rama                               | Contenido                                                                             |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| `feature/modulo-1-autenticacion` | Módulos 1 y 3: backend (auth, perfil, follows) + frontend (layout AdminKit + vistas) |
| `feature/modulo-2-reproductor`   | Módulos 2 y 4: backend (Track/Album/Artist/Genre) + frontend (player + biblioteca)   |

> Las ramas agrupan los 4 módulos: `feature/modulo-1-autenticacion` contiene los **Módulos 1 y 2** (autenticación, perfil y follows); `feature/modulo-2-reproductor` contiene los **Módulos 3 y 4** (reproductor y búsqueda de canciones).
