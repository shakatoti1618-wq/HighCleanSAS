# MÓDULO 2 — FRONTEND BASE

## Qué se hizo

Se construyó la base del frontend en `app/frontend/`: proyecto Vite + React + TypeScript estricto, React Router con 4 páginas, Tailwind CSS, layout (Navbar + Footer) y testing con Vitest + React Testing Library.

## Por qué

Era el siguiente módulo del plan y la base sobre la que se construirán todos los módulos visuales (información corporativa, servicios, galería, reseñas, contacto, WhatsApp y SEO).

## Arquitectura

```text
main.tsx (BrowserRouter)
  ↓
App.tsx (Routes)
  ↓
components/Layout.tsx
  ├── Navbar.tsx
  ├── <Outlet /> → pages/
  │                  ├── Home (index /)
  │                  ├── Servicios (/servicios)
  │                  ├── Nosotros (/nosotros)
  │                  └── Contacto (/contacto)
  └── Footer.tsx
```

- `index.html`: lang `es`, título y meta description de High Clean SAS (base SEO temprana).
- `index.css`: importa Tailwind CSS v4 y estilos base.
- TypeScript estricto (`strict` y `noUncheckedIndexedAccess` activados).

## Archivos creados

- `app/frontend/` (scaffold Vite react-ts): `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `.gitignore`, `.oxlintrc.json`, `public/favicon.svg`, `README.md`
- `app/frontend/src/main.tsx`
- `app/frontend/src/App.tsx` (rutas)
- `app/frontend/src/index.css`
- `app/frontend/src/components/Layout.tsx`
- `app/frontend/src/components/Navbar.tsx`
- `app/frontend/src/components/Footer.tsx`
- `app/frontend/src/pages/Home.tsx`
- `app/frontend/src/pages/Servicios.tsx`
- `app/frontend/src/pages/Nosotros.tsx`
- `app/frontend/src/pages/Contacto.tsx`
- `app/frontend/src/test/setup.ts`
- `app/frontend/src/App.test.tsx`
- `docs/modules/MODULO-2-FRONTEND-BASE.md`
- `aprendizaje/03-frontend/react.md`, `aprendizaje/03-frontend/vite.md`
- `aprendizaje/13-glosario/react.md`, `aprendizaje/13-glosario/spa.md`, `aprendizaje/13-glosario/component.md`

## Archivos modificados

- `app/frontend/.gitkeep` (eliminado por el scaffold)

## Dependencias

- **React 19**, **react-dom**: biblioteca UI.
- **react-router-dom**: enrutado de la SPA.
- **tailwindcss + @tailwindcss/vite**: utilidades CSS.
- Dev: **vite**, **@vitejs/plugin-react**, **typescript**, **@types/node**, **@types/react**, **@types/react-dom**, **oxlint** (lint), **vitest**, **jsdom**, **@testing-library/react**, **@testing-library/jest-dom**, **@testing-library/user-event**.

## API

Ninguna: el frontend aún no consume backend. Esto llegará a partir del Módulo 3.

## Base de datos

Ninguna. No aplica en el frontend.

## Seguridad

- Sin datos de negocio inventados: placeholders `TODO: información pendiente de confirmar con High Clean SAS`.
- No se exponen secretos; no hay aún comunicación con backend.
- Formulario de contacto solo estructura local (el envío llega en el Módulo 9).

## Testing

```text
npm run lint       → oxlint, sin errores
npm run typecheck  → tsc -b, sin errores
npm test           → Vitest + RTL, 3 pruebas pasan
npm run build      → tsc -b && vite build, dist generado
```

Pruebas: render de la app, navegación a Servicios y a Contacto.

## Git

Commits locales por unidad de cambio. Push: NO REALIZADO.

## Problemas

- `create-vite` se cancelaba con la carpeta existente. Solución: eliminar `app/frontend` y dejar que lo creara de nuevo.
- Test inicial fallaba por dos enlaces llamados "servicios" (navegación y CTA del hero). Solución: selector exacto `^servicios$`.

## Soluciones

Ver sección problemas.

## Cómo modificarlo

- Páginas nuevas: crear archivo en `src/pages/` y registrar la ruta en `src/App.tsx`.
- Componentes compartidos: `src/components/`.
- Estilos: clases utilitarias Tailwind; estilos globales en `src/index.css`.
- Para probar: `npm run dev` (desarrollo) o `npm test` (pruebas).