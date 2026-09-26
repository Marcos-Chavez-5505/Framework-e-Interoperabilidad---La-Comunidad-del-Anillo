# La Comunidad del Anillo — TP2 Frameworks e Interoperabilidad

Prueba de concepto académica que evalúa el uso conjunto de:

- **Strapi v5** como CMS (backend, REST API).
- **React 19 + Vite** como framework frontend.
- **AdminKit** como template CSS/JS basado en **Bootstrap 5**.

Dominio: aplicación conceptual similar a un *Spotify colaborativo* con tres módulos obligatorios:

1. **Autenticación de usuarios** (Módulo 1 — implementado).
2. **Reproductor de música** (Módulo 2 — implementado).
3. **Gestión de playlists** (Módulo 3 — pendiente).

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

Módulo: **Follow** (`api::follow.follow`):

- [ ] create
- [ ] delete
- [ ] find
- [ ] findOne

Módulo: **Usuarios** (`plugin::users-permissions.user`):

- [ ] `updateMe` (edición de perfil propia, `PUT /api/user/me`)
- [ ] `find` (búsqueda de personas y validación de relaciones)
- [ ] `findOne`
- [ ] `count`

### Checklist — Módulo 2 (Biblioteca y reproductor)

Módulo: **Track** (`api::track.track`):

- [ ] find
- [ ] findOne

Módulo: **Album** (`api::album.album`):

- [ ] find
- [ ] findOne

Módulo: **Artist** (`api::artist.artist`):

- [ ] find
- [ ] findOne

Módulo: **Genre** (`api::genre.genre`):

- [ ] find
- [ ] findOne

> Si falta `find` sobre el destinatario de una relación, Strapi v5 responde `400 Invalid key ...` (validación `throwRestrictedRelations`); es un comportamiento esperado, no un bug.

---

## Flujo de prueba del Módulo 1

1. Registrar un usuario (`/register`).
2. Iniciar sesión (`/login`) — el JWT se guarda en `localStorage`.
3. En `/perfil`: editar `username`, `bio` y URL de `avatar` (`PUT /api/user/me`).
4. En `/personas`: buscar por username y **seguir/dejar de seguir** (`POST`/`DELETE /api/follows`).

Endpoints nativos de Strapi usados: `POST /api/auth/local/register`, `POST /api/auth/local`, `GET /api/users/me`. Endpoint personalizado mínimo: `PUT /api/user/me` (v5 no expone edición del propio perfil por vía nativa).

## Flujo de prueba del Módulo 2 (Reproductor)

1. Sembrar la biblioteca con el script: `cd backend && node scripts/seed.js` (idempotente: si ya hay tracks, omite). Crea 5 géneros, 5 artistas, 4 álbumes y 10 tracks.
2. En `/musica` (Biblioteca): buscar por canción/artista y filtrar por género.
3. Tocar una canción: entra en la cola, aparece la barra fija con controles.
4. Probar play/pause, siguiente/anterior, modo aleatorio, repetición y barra de progreso.

El script usa `documentService` de Strapi (crea entradas sin pasar por permisos REST) y datos temáticos: `audio_url` con MP3 públicos estables (SoundHelix) como placeholder —para usar Jamendo solo hay que reemplazar los `audio_url` en `backend/scripts/seed.js`— y `cover` de picsum.photos.

Decisiones del módulo: reproducción con **HTML5 `<audio>`** (sin librerías extra), URLs de audio **externas** guardadas en Strapi (sin integrar la API de Jamendo en runtime), estado con **Context API** y barra fija dentro del layout. Los content-types **Track/Album/Artist/Genre** se crean con rutas REST estándar de Strapi.

### Nota sobre sesiones (error "Missing or invalid credentials")

Si el navegador conserva un JWT emitido con un `JWT_SECRET` distinto (o inválido), todas las rutas protegidas devuelven `401` y la app muestra ese mensaje. Desde ahora, el interceptor de axios (`frontend/src/api/strapi.js`) detecta el `401`, limpia `localStorage` y redirige a `/login`; solo hay que volver a iniciar sesión.

---

## Integración de AdminKit (evidencia para el informe)

- Estado original: template AdminKit `@adminkit/core` importado tal cual (CSS `app.css` + JS `app.js`).
- Adaptación: el layout reconstruye la estructura HTML de AdminKit (`.wrapper`, `.sidebar`, `.navbar`, `.content`, `.footer`) dentro de componentes React en `frontend/src/layout/AppLayout.jsx`.
- Los íconos *(feather)* vienen embebidos en `app.js` del template; se reemplazan con `window.feather.replace()` vía `src/hooks/useFeather.js`.
- El CSS del template de Vite (`index.css` original) se reemplazó por un reset mínimo para no chocar con AdminKit.

---

## Portafolio de ramas / commits

| Rama                               | Contenido                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| `feature/modulo-1-autenticacion` | Módulo 1: backend (auth, perfil, follows) + frontend (layout AdminKit + vistas) |
| `feature/modulo-2-reproductor`   | Módulo 2: backend (Track/Album/Artist/Genre) + frontend (player + biblioteca)   |

## Pendientes

- [ ] Módulo 3: Playlists (personales/celaborativas, invitaciones temporales).
- [ ] Evidencia de reproducción de audio.
- [ ] Documentación de decisiones en Git, tablero, presentación e informe.
