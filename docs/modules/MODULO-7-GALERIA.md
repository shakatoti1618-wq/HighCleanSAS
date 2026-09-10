# MÓDULO 7 — GALERÍA

## Qué se hizo

Se expone la lista pública de imágenes: `GET /api/v1/gallery` por capas (route → controller → service → repository) con **orden determinístico** (`createdAt ASC, id ASC` como desempate), mismo patrón que Servicios. Se crea la página dedicada **`/galeria`** en el frontend con enlace en la Navbar y ruta en `App.tsx`. Sin inventar fotografías: la tabla está vacía, así que la página muestra el placeholder `TODO` y un ícono vacío.

## Por qué

Era el siguiente módulo funcional del plan (sección 25). La galería solo lista imágenes de la empresa; las fotos reales se cargarán desde el panel admin (Módulo 13) o desde el seed cuando el propietario las entregue.

## Arquitectura

```text
GET /api/v1/gallery
  ↓
routes/gallery.routes.ts
  ↓
controllers/gallery.controller.ts
  ↓
services/gallery.service.ts
  ↓
repositories/gallery.repository.ts
  ↓ (orderBy createdAt ASC, id ASC)
lib/prisma.ts → PostgreSQL
```

Frontend: `pages/Galeria.tsx` → `fetch('/api/v1/gallery')` (proxy dev) → `lib/api.ts` → tarjetas con `object-cover` y `loading="lazy"`.

## Archivos creados

- `app/backend/src/repositories/gallery.repository.ts`
- `app/backend/src/services/gallery.service.ts`
- `app/backend/src/controllers/gallery.controller.ts`
- `app/backend/src/routes/gallery.routes.ts`
- `app/backend/src/gallery.test.ts`
- `app/frontend/src/pages/Galeria.tsx`
- `docs/modules/MODULO-7-GALERIA.md`

## Archivos modificados

- `app/backend/src/routes/index.ts` (registra `/gallery`)
- `app/frontend/src/lib/api.ts` (`GalleryImage` + `fetchGalleryImages`)
- `app/frontend/src/App.tsx` (ruta `galeria`)
- `app/frontend/src/components/Navbar.tsx` (enlace "Galería")

## Dependencias

- Ninguna.

## API

- `GET /api/v1/gallery` → 200 con arreglo de imágenes ordenado (`createdAt` ASC, `id` ASC). `[]` si no hay registros.
- Campos: `id`, `url`, `alt`, `companyId`, `createdAt`.

## Base de datos

- Tabla `GalleryImage` de solo lectura pública (relación con `Company`, creada en la migración `init` del Módulo 4). Sin seed de fotos inventadas.

## Seguridad

- Endpoint público de solo lectura.

## Testing

```text
Backend: lint ✅ typecheck ✅ test ✅ (7 total; 2 nuevos de galería) build ✅
Frontend: lint ✅ typecheck ✅ test ✅ (3) build ✅
Smoke: 5173/api/v1/gallery → [] (proxy funcionando)
```

Test clave (mismo patrón que Servicios): insertar 3 imágenes con `createdAt` desordenado y verificar que la respuesta las ordena por `createdAt` ASC, `id` ASC; además lista vacía → `[]`.

## Git

- Commits por archivo/capa (17.1: 1 responsabilidad por commit). Push: NO REALIZADO.

## Problemas

- Ninguno bloqueante.

## Soluciones

- (ver problemas)

## Cómo modificarlo

- Cambiar el orden del listado: `gallery.repository.ts`.
- Ajustar tarjetas o lazy loading: `app/frontend/src/pages/Galeria.tsx`.
- Añadir fotos: insertar registros en `GalleryImage` (seed) o desde el panel admin (Módulo 13).
- Campo `alt` pendiente de definición real: se mostrará con placeholder TODO hasta confirmar con High Clean SAS (sección 4).