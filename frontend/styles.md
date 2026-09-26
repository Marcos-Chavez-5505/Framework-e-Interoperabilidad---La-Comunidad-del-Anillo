
# Style Guide — App Música/Chat

## Uso

Guía de referencia visual. Aplicar estos valores exactos en componentes React/Tailwind. No inventar variantes de color fuera de esta paleta.

---

## Paleta base

| Token              | Hex aprox   | Uso                                              |
| ------------------ | ----------- | ------------------------------------------------ |
| `bg-primary`     | `#0e0c10` | Fondo principal (chat, home)                     |
| `bg-sidebar`     | `#2a232e` | Sidebar, header, player bar                      |
| `bg-surface`     | `#3a3040` | Bubbles ajenas, cards hover, botones secundarios |
| `bg-input`       | `#332b38` | Input de chat/search                             |
| `text-primary`   | `#ffffff` | Texto principal                                  |
| `text-secondary` | `#a89bb0` | Subtítulos, "Artista", labels menores           |
| `text-muted`     | `#6f6577` | Placeholders, texto deshabilitado                |

## Color de acento (marca)

| Token                | Hex aprox   | Uso                                                                    |
| -------------------- | ----------- | ---------------------------------------------------------------------- |
| `accent-pink`      | `#e0407e` | Botón play, item activo (Home), avatar Lu, badge LABEL, botón enviar |
| `accent-pink-soft` | `#c76a94` | Bubbles propias (mensaje enviado), avatar secundario                   |
| `accent-purple`    | `#6f5aa8` | Avatar "Este es otro mensaje" (usuario alterno)                        |

## Gradientes

| Nombre                    | De → A                          | Uso                                                                                 |
| ------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| `gradient-card`         | `#c9bcd1` → `#8f7f9c`       | Placeholder de cards (álbumes/playlists), vertical, de claro arriba a oscuro abajo |
| `gradient-card-overlay` | `transparent` → `#000000cc` | Overlay inferior sobre card para legibilidad de Título/Artista                     |
| `gradient-header-fade`  | `#000000` → `transparent`   | Fade superior detrás de flechas/search en home desktop                             |

---

## Componentes específicos

**Sidebar / Nav**

- Fondo: `bg-sidebar`
- Item activo: texto `accent-pink`, sin fondo (solo color de texto cambia)
- Item inactivo: `text-secondary`

**Player bar**

- Fondo: `bg-sidebar`
- Barra de progreso: fill `accent-pink`, track `bg-surface`
- Iconos: `text-secondary`, hover `text-primary`

**Chat bubbles**

- Mensaje propio (derecha): fondo `accent-pink-soft`, texto blanco
- Mensaje ajeno (izquierda): fondo `bg-surface`, texto blanco
- Timestamp: `text-muted`, tamaño pequeño

**Avatares**

- Circulares, colores rotan entre `accent-pink`, `accent-purple`, `accent-pink-soft` según usuario
- Iniciales blancas centradas

**Cards (Home)**

- Imagen: `gradient-card` como placeholder
- Overlay inferior: `gradient-card-overlay`
- `LABEL`: texto `accent-pink`, uppercase, tamaño pequeño, bold
- `Título`: blanco, bold
- `Artista`: `text-secondary`

**Bottom nav (mobile)**

- Fondo: `bg-sidebar`
- Ícono+label activo: `accent-pink`
- Inactivo: `text-secondary`

---

## Tipografía

- Familia: sans-serif geométrica (tipo Inter/Poppins), no serif
- Pesos: regular (body), semibold (títulos, nombres), bold (Título de card)
- Jerarquía tamaños: `text-xs` (timestamps/labels) → `text-sm` (body) → `text-base/lg` (títulos)

## Bordes / radios

- Bubbles: `rounded-xl` (~12px), esquina pegada al avatar más angosta
- Cards: `rounded-md` (~8px)
- Avatares: `rounded-full`

## Espaciado

- Padding interno bubbles: `px-4 py-2`
- Gap entre mensajes mismo usuario: `mt-1`
- Gap entre usuarios distintos: `mt-4`

---

## Tailwind config sugerido

```js
theme: {
  extend: {
    colors: {
      'bg-primary': '#0e0c10',
      'bg-sidebar': '#2a232e',
      'bg-surface': '#3a3040',
      'bg-input': '#332b38',
      'text-secondary': '#a89bb0',
      'text-muted': '#6f6577',
      'accent-pink': '#e0407e',
      'accent-pink-soft': '#c76a94',
      'accent-purple': '#6f5aa8',
    },
    backgroundImage: {
      'gradient-card': 'linear-gradient(180deg, #c9bcd1 0%, #8f7f9c 100%)',
      'gradient-card-overlay': 'linear-gradient(180deg, transparent 40%, #000000cc 100%)',
    }
  }
}
```

**Nota:** hex son aproximaciones visuales de capturas, no valores exactos de diseño. Ajustar con eyedropper sobre Figma/imagen original si existe.
