# MÓDULO 5 — INFORMACIÓN CORPORATIVA

## Qué se hizo

Se expone la información de la empresa en la API y se consume en el frontend. Se creó la primera consulta Prisma de negocio, organizada por capas (route → controller → service → repository), un seed idempotente para la fila `Company`, y la página "Nosotros" que carga misión/visión/valores desde la API. Ningún dato de negocio fue inventado: lo desconocido queda en `null` y el frontend muestra el placeholder `TODO`.

## Por qué

Era el primer módulo funcional (después de base de datos) y habilita mostrar la empresa al visitante. Además estrena la capa `Repositories` que pedía la arquitectura del prompt.

## Arquitectura

```text
GET /api/v1/company
  ↓
routes/company.routes.ts
  ↓
controllers/company.controller.ts
  ↓
services/company.service.ts
  ↓
repositories/company.repository.ts   ← capa nueva (trae prisma)
  ↓
lib/prisma.ts → PostgreSQL
```

Frontend:

```text
pages/Nosotros.tsx
  ↓ fetch('/api/v1/company')
  ↓ (dev) proxy de Vite → http://localhost:3000
lib/api.ts (tipos + fetchCompany)
```

## Archivos creados

- `app/backend/prisma/seed.ts`
- `app/backend/src/repositories/company.repository.ts`
- `app/backend/src/services/company.service.ts`
- `app/backend/src/controllers/company.controller.ts`
- `app/backend/src/routes/company.routes.ts`
- `app/backend/src/company.test.ts`
- `app/frontend/src/lib/api.ts`
- `docs/modules/MODULO-5-INFO-CORPORATIVA.md`

## Archivos modificados

- `app/backend/prisma.config.ts` (seed registrado)
- `app/backend/package.json` (script `db:seed`)
- `app/backend/src/routes/index.ts` (registra /company)
- `app/frontend/vite.config.ts` (proxy `/api` → :3000)
- `app/frontend/src/pages/Nosotros.tsx`
- `docs/decisions/ADR-002-arquitectura-frontend-backend.md`

## Dependencias

- Ninguna nueva (seed usa `tsx` y `dotenv` ya instalados).

## API

- `GET /api/v1/company` → 200 con objeto `Company` (campos `description`, `mission`, `vision`, `values`, `phone`, `email`, `address`, `schedules` pueden ser `null`).
- 404 `NotFoundError` si no hay registro de empresa.

## Base de datos

- Tabla `Company`: el seed `upsert` asegura (idempotente) el registro `High Clean SAS`; el resto de campos queda `null` hasta confirmar datos reales.

## Seguridad

- Endpoint público de solo lectura.
- Respuesta limitada a datos de empresa; no expone credenciales.

## Testing

```text
Backend: lint ✅ typecheck ✅ test ✅ (3) build ✅
Frontend: lint ✅ typecheck ✅ test ✅ (3) build ✅
Smoke: 5173/api/v1/company → JSON real (proxy funcionando)
```

## Git

- Commits locales por archivo. Push: NO REALIZADO.

## Problemas

1. En el smoke test, `Start-Process npm` no arrancaba (Windows exige `npm.cmd`) y había un dev server viejo en 5173 sin proxy.

## Soluciones

1. Usar `cmd.exe /c npm run dev` y matar el proceso anterior del puerto antes de validar.

## Cómo modificarlo

- Datos de la empresa: actualizar la fila en `prisma/seed.ts` (o via `db:studio`) y volver a correr `npm run db:seed`.
- Nueva consulta: añadir función en `company.repository.ts` y usarla desde el service, sin tocar rutas/controller.
- Cambiar endpoint de la API en frontend: `app/frontend/src/lib/api.ts`.
- La comunicación de producción (mismo origen vs `VITE_API_BASE_URL`) se decide en el Módulo 17 (ver ADR-002).