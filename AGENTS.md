
# AGENTS.md

## 1. Rol y objetivo

Este repositorio corresponde al **TP2 – Frameworks e Interoperabilidad**.

Tu función como agente de IA es ayudar a desarrollar, modificar, analizar y documentar una **prueba de concepto académica**.

El objetivo principal del TP2 es obtener evidencia suficiente para elaborar un **veredicto válido para el informe** sobre el uso conjunto de:

* Strapi v5 como CMS.
* React + Vite como framework frontend.
* AdminKit como template CSS basado en Bootstrap 5.

No tratar este proyecto como una aplicación de producción.

Priorizar siempre:

1. Soluciones simples.
2. Claridad didáctica.
3. Evidencia demostrable.
4. Facilidad de documentación.
5. Cumplimiento de los requisitos del TP2.
6. Evitar over-engineering.

---

# 2. Alcance académico

El TP2 requiere:

* Investigar y utilizar un CMS.
* Investigar y utilizar un framework frontend.
* Aplicarlos en una prueba de concepto.
* Utilizar un template CSS.
* Mostrar el template original sin modificaciones.
* Mostrar y documentar posteriormente los cambios realizados.
* Crear o modificar al menos **3 módulos funcionales**.
* Documentar las decisiones mediante Git.
* Mantener ramas y commits comprensibles.
* Preparar README, tablero colaborativo, presentación e informe.
* Obtener conclusiones que permitan evaluar la utilización de Strapi + React + AdminKit.

### Restricción crítica

**NO implementar interoperabilidad con otros sistemas.**

El nombre de la materia/TP no implica que debamos agregar integraciones externas.

No incorporar:

* APIs externas innecesarias.
* Microservicios.
* Sistemas externos.
* Integraciones con terceros.
* GraphQL si REST resuelve el requisito.
* Arquitecturas distribuidas innecesarias.

---

# 3. Dominio del proyecto

El dominio corresponde a una aplicación conceptual similar a un **Spotify colaborativo**.

Las áreas principales son:

* Autenticación.
* Canciones y álbumes.
* Perfil de usuario.
* Reproducción de música.
* Playlists personales y colaborativas.

Los tres módulos obligatorios seleccionados son:

1. Autenticación de usuarios.
2. Reproductor de música.
3. Gestión de playlists.

No ampliar significativamente el alcance sin que sea necesario para demostrar estos módulos.

---

# 4. Stack técnico obligatorio

## Backend

* Strapi `5.55.0`.
* Node.js.
* REST API.
* SQLite.
* `better-sqlite3`.

### Base de datos

La base de datos del TP2 es:

```text
SQLite
```

No configurar PostgreSQL.

PostgreSQL está previsto para el Trabajo Final, pero **NO forma parte del entorno actual del TP2**.

No agregar:

```text
pg
@prisma/client
Prisma
```

ni reemplazar SQLite por PostgreSQL salvo que se solicite explícitamente.

---

## Frontend

* React `19.2.8`.
* Vite `8.3.0`.
* AdminKit.
* Bootstrap 5.

La API utilizada debe ser:

```text
REST
```

No implementar GraphQL.

---

# 5. Estado conocido del repositorio

La estructura inicial esperada es:

```text
/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   ├── plugins.js
│   │   └── api.js
│   ├── src/
│   │   └── api/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   └── App.jsx
│   └── package.json
│
└── .git/
```

### Backend actual

* Strapi v5 instalado.
* `config/database.js` utiliza SQLite.
* `better-sqlite3` es el driver disponible.
* No existe actualmente driver PostgreSQL.
* `.env.example` existe.
* No asumir que existe un `.env` funcional.
* `backend/src/api` inicialmente está vacío.
* No asumir que existen content-types personalizados.
* `config/plugins.js` permite archivos `audio/*`.
* No asumir que existen archivos de audio reales.

### Frontend actual

Inicialmente:

* React + Vite.
* `src/App.jsx` corresponde al template inicial de Vite.
* AdminKit todavía no está integrado.
* No asumir que existe React Router.
* No asumir que existe un sistema de estado global.
* No asumir que existe cliente HTTP.
* No asumir que existen componentes propios.
* No asumir que existen estilos personalizados.

Antes de modificar una parte del proyecto, inspeccionar su estado real.

---

# 6. Regla fundamental: verificar antes de modificar

No asumir que una dependencia, archivo, endpoint, configuración o funcionalidad existe.

Antes de realizar cambios:

1. Inspeccionar los archivos relevantes.
2. Verificar las dependencias instaladas.
3. Revisar la configuración existente.
4. Mantener las decisiones ya tomadas.
5. Modificar únicamente lo necesario.

No reemplazar configuraciones completas cuando sea suficiente modificar una parte.

No borrar código existente sin una razón técnica clara.

---

# 7. Módulo 1 — Autenticación

## Objetivo

Implementar una demostración mínima de:

* Registro.
* Login.
* Logout.
* Consulta del usuario actual.
* Edición básica del perfil.
* Búsqueda de personas.
* Seguimiento de personas.

## Backend

Utilizar el plugin:

```text
users-permissions
```

Extender el usuario para incorporar como mínimo:

```text
bio
avatar
username
```

`username` debe ser único.

Crear un content-type para relaciones de seguimiento:

```text
Follow
```

Utilizar los endpoints nativos de Strapi cuando sean suficientes:

```text
/api/auth/local/register
/api/auth/local
/api/users/me
```

No crear endpoints personalizados si los endpoints nativos resuelven el requisito.

## Frontend

Crear las vistas/componentes necesarios para demostrar:

```text
Login
Register
Perfil
BuscarPersonas
```

Utilizar AdminKit para los formularios y elementos visuales cuando corresponda.

El JWT puede almacenarse mediante:

* `localStorage`, o
* Context API.

Utilizar una única estrategia coherente.

Proteger las rutas privadas mediante un mecanismo como:

```text
PrivateRoute
```

## Dependencias posibles

Solo agregar si son realmente necesarias:

```text
axios
react-router-dom
jwt-decode
react-hook-form
```

No instalar todas automáticamente.

---

# 8. Módulo 2 — Reproductor de música

## Objetivo

Demostrar:

* Reproducción.
* Play/pause.
* Modo aleatorio.
* Repetición.
* Barra de progreso.
* Búsqueda de canciones.

## Backend

Crear los content-types necesarios:

```text
Track
Album
Artist
Genre
```

Los campos pueden incluir:

```text
Track:
- title
- duration
- audio_url
- cover
- release_date
```

Utilizar relaciones entre las entidades cuando sean necesarias.

Strapi debe proporcionar los metadatos y, para la demostración, puede:

* servir archivos de audio, o
* almacenar/utilizar URLs externas.

No implementar un sistema avanzado de almacenamiento de música.

## Frontend

Crear un componente persistente:

```text
Player
```

El reproductor debe formar parte del layout principal.

Para reproducción utilizar preferentemente:

```text
HTML5 <audio>
```

o:

```text
Howler.js
```

Elegir la opción más simple que permita demostrar correctamente el requisito.

El estado puede gestionarse mediante:

* Context API, o
* Zustand.

No agregar Zustand si Context API resulta suficiente.

AdminKit debe utilizarse para:

* Cards.
* Listas.
* Controles.
* Elementos visuales relacionados con música.

## Dependencias posibles

```text
howler
react-icons
axios
swr
react-query
```

Agregar únicamente las necesarias.

---

# 9. Módulo 3 — Gestión de playlists

## Objetivo

Demostrar:

* Crear playlists personales.
* Crear playlists colaborativas.
* Añadir canciones.
* Invitar usuarios.
* Favoritos.

## Reglas funcionales obligatorias

### Invitaciones

El enlace de invitación debe ser:

* Único.
* Temporal.

Puede utilizarse un token generado mediante `uuid`.

### Colaboradores

Un colaborador puede:

```text
AGREGAR canciones
```

pero no puede:

```text
ELIMINAR canciones
```

### Duplicados

Una canción no puede aparecer dos veces dentro de la misma playlist.

Esta regla debe respetarse en la lógica correspondiente.

### Propietario

El creador de la playlist mantiene los permisos de administración correspondientes.

---

## Backend

Crear los content-types necesarios:

```text
Playlist
PlaylistTrack
Collaborator
```

Las playlists deben contemplar campos equivalentes a:

```text
name
description
is_collaborative
owner
tracks
collaborators
inviteToken
inviteExpiresAt
```

Implementar las políticas de acceso necesarias para que:

* El propietario pueda administrar la playlist.
* Los colaboradores puedan agregar canciones.
* Los colaboradores no puedan eliminar canciones.
* Una canción no pueda duplicarse dentro de una playlist.

Mantener las reglas simples y demostrables.

No crear un sistema complejo de roles si las políticas de Strapi son suficientes.

---

## Frontend

Crear las vistas/componentes necesarios:

```text
MisPlaylists
DetallePlaylist
CrearPlaylist
UnirsePorEnlace
```

Utilizar AdminKit para:

* Tablas.
* Listas.
* Modales.
* Formularios.

El enlace puede seguir una estructura similar a:

```text
/join/:playlistId
```

El mecanismo de invitación debe utilizar un identificador/token único y temporal.

## Dependencias posibles

```text
uuid
axios
react-router-dom
sweetalert2
```

Agregar únicamente las necesarias.

---

# 10. AdminKit

AdminKit es un **template HTML/CSS/JS basado en Bootstrap 5**.

No tratarlo como una librería oficial de componentes React.

No asumir que existe una API React equivalente a:

```text
<AdminKitButton />
<AdminKitCard />
```

La integración debe realizarse adaptando:

* HTML.
* CSS.
* Bootstrap.
* JavaScript del template cuando sea necesario.

Si se utiliza un port React no oficial, verificar primero su compatibilidad y justificar su incorporación.

## Requisito académico

El TP2 requiere demostrar:

### Estado original

Mostrar el template AdminKit sin modificaciones.

### Estado adaptado

Mostrar posteriormente las modificaciones realizadas para integrarlo con:

```text
React
Strapi
los tres módulos
```

Las modificaciones deben poder identificarse y documentarse.

No modificar innecesariamente el template antes de registrar/documentar su estado original.

---

# 11. API

Utilizar exclusivamente:

```text
REST
```

Priorizar endpoints nativos de Strapi cuando resuelvan el requisito.

Crear endpoints personalizados únicamente cuando exista una necesidad funcional concreta.

No introducir GraphQL.

No agregar una capa de API innecesaria entre React y Strapi.

---

# 12. Autenticación y seguridad

La autenticación se basa en:

```text
Strapi Users & Permissions v5
JWT
```

No construir un sistema de autenticación independiente si Strapi ya proporciona la funcionalidad necesaria.

No hardcodear:

* JWT secrets.
* Credenciales.
* Tokens.
* Claves privadas.
* Configuración sensible.

Utilizar `.env`.

No incluir `.env` en Git.

Si se modifica `.env.example`, mantenerlo libre de secretos reales.

---

# 13. Variables de entorno

El entorno actual utiliza SQLite.

Crear/configurar el `.env` necesario para ejecutar Strapi, pero no introducir credenciales de PostgreSQL.

Si una variable es necesaria:

1. Agregarla al `.env`.
2. Si corresponde, documentarla también en `.env.example`.
3. Nunca incluir valores secretos reales en el repositorio.

---

# 14. Gestión de dependencias

Antes de instalar una dependencia:

1. Verificar si ya existe una solución con las dependencias actuales.
2. Determinar si realmente simplifica el desarrollo.
3. Evitar dependencias redundantes.
4. Mantener compatibilidad con React 19 y las versiones actuales del proyecto.

No realizar downgrades de versiones importantes sin una razón explícita.

No cambiar el stack establecido para solucionar problemas menores.

---

# 15. Git

Git forma parte de los requisitos del TP2.

Los cambios deben poder explicarse mediante commits.

Los commits deben:

* Tener un propósito claro.
* Evitar mezclar funcionalidades no relacionadas.
* Permitir identificar las etapas del desarrollo.

Cuando sea apropiado, organizar el trabajo mediante ramas.

Documentar decisiones técnicas relevantes en el README.

No realizar operaciones destructivas de Git sin autorización explícita.

No ejecutar automáticamente:

```text
git reset --hard
git clean -fd
git push --force
```

---

# 16. Documentación

La documentación forma parte del resultado del TP2.

Al implementar una funcionalidad importante, considerar qué evidencia deberá quedar disponible para:

* README.
* Informe.
* Presentación.
* Tablero colaborativo.

Documentar especialmente:

* Por qué se eligió Strapi.
* Por qué se eligió React.
* Cómo se integró AdminKit.
* Qué problemas aparecieron.
* Qué modificaciones fueron necesarias.
* Qué funcionalidades pudieron implementarse.
* Qué limitaciones aparecieron.
* Qué dependencias adicionales fueron necesarias.
* Qué conclusiones pueden extraerse de la prueba de concepto.

No inventar resultados ni afirmar que una integración funciona sin haberla probado.

---

# 17. Criterio para tomar decisiones

Cuando existan varias soluciones técnicamente válidas:

1. Elegir la más simple.
2. Preferir las capacidades nativas de Strapi/React.
3. Evitar dependencias adicionales.
4. Mantener el código fácil de explicar en una exposición.
5. Mantener la solución alineada con una prueba de concepto.
6. Priorizar aquello que genere evidencia útil para el informe.

La solución técnicamente más sofisticada no es necesariamente la adecuada para este TP.

---

# 18. Qué NO hacer

No:

* Convertir el TP2 en una aplicación de producción.
* Migrar SQLite a PostgreSQL.
* Implementar GraphQL.
* Agregar interoperabilidad externa.
* Crear microservicios.
* Implementar arquitectura innecesariamente compleja.
* Crear sistemas avanzados de permisos sin necesidad.
* Agregar dependencias por conveniencia.
* Reescribir grandes partes del proyecto sin necesidad.
* Asumir que una funcionalidad está implementada sin verificarla.
* Inventar endpoints de Strapi.
* Inventar APIs de AdminKit.
* Hardcodear secretos.
* Modificar el alcance de los tres módulos sin autorización.

---

# 19. Forma de trabajar

Antes de implementar:

1. Analizar la estructura existente.
2. Identificar qué requisito del TP2 se está resolviendo.
3. Determinar la modificación mínima necesaria.
4. Verificar compatibilidad con el stack.
5. Implementar.
6. Probar.
7. Indicar qué se modificó y dónde.
8. Señalar cualquier limitación relevante.

Cuando se solicite código, indicar siempre:

```text
Archivo: ruta/al/archivo
```

antes del bloque correspondiente.

No proporcionar código hipotético como si hubiera sido probado.

Si una decisión depende de información que no está disponible, inspeccionar primero el repositorio antes de asumirla.

---

# 20. Estilo de respuesta

Responder siempre en:

```text
español
```

Priorizar respuestas:

* Directas.
* Concisas.
* Didácticas.
* Orientadas a la acción.

Evitar explicaciones extensas cuando no sean necesarias.

Para cambios de código, indicar:

1. Archivo.
2. Cambio.
3. Código necesario.
4. Cómo verificarlo.

No explicar conceptos básicos si no son relevantes para la tarea solicitada.

---

# 21. Pendientes actuales

Los pendientes conocidos son:

* [ ] Crear/configurar `.env` de Strapi.
* [ ] Definir content-types.
* [ ] Integrar AdminKit en React.
* [ ] Configurar React Router.
* [ ] Implementar autenticación JWT.
* [ ] Implementar los componentes mínimos del módulo de autenticación.
* [ ] Implementar reproductor de música.
* [ ] Implementar content-types de música.
* [ ] Implementar playlists personales.
* [ ] Implementar playlists colaborativas.
* [ ] Implementar reglas de permisos.
* [ ] Implementar invitaciones temporales.
* [ ] Evitar duplicados de canciones.
* [ ] Probar reproducción de audio.
* [ ] Documentar cambios del template.
* [ ] Documentar decisiones en Git.
* [ ] Completar README.
* [ ] Mantener evidencia para presentación e informe.

No asumir que todos estos pendientes siguen pendientes: verificar el estado real del repositorio antes de trabajar sobre ellos.

---

# 22. Referencias técnicas

Recursos principales:

* Strapi v5 documentation.
* React documentation.
* Vite documentation.
* AdminKit documentation.
* Bootstrap 5 documentation.
* Howler.js documentation.
* Axios documentation.
* React Router documentation.

Cuando sea necesario consultar documentación actualizada, utilizar la documentación oficial correspondiente.

---

# 23. Regla final

El objetivo no es construir la aplicación definitiva del Trabajo Final.

El objetivo es construir una **prueba de concepto funcional, simple y demostrable** que permita evaluar:

```text
Strapi v5
    +
React + Vite
    +
AdminKit
```

mediante los tres módulos:

```text
Autenticación
Reproductor de música
Playlists
```

Toda decisión técnica debe evaluarse según su utilidad para ese objetivo.
