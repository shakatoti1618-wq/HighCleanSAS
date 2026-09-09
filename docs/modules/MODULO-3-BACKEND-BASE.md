# MÓDULO 3 — BACKEND BASE

## Qué se hizo

Se construyó la base del backend en `app/backend/`: API Express + TypeScript estricto con arquitectura por capas (routes → controllers → services), endpoint `/api/v1/health`, manejo centralizado de errores (`AppError` y subclases) con middleware global, seguridad base (Helmet, CORS, rate limiting), validación de entorno con Zod y pruebas con Vitest + Supertest.

## Por qué

Era el siguiente módulo del plan y el punto donde el frontend empezará a consumir la API. La separación por capas garantiza que en el Módulo 4 (PostgreSQL + Prisma) solo haya que añadir la capa de repositorios.

## Arquitectura

```text
server.ts (escucha)
  ↓
app.ts (createApp: helmet, cors, json, rate limit)
  ↓
routes/index.ts (/api/v1)
  └── routes/health.routes.ts → controllers/health.controller.ts
                                  ↓
                              services/health.service.ts
middleware/error.middleware.ts  (404 + error global)
config/env.ts                   (Zod)
utils/httpError.ts              (AppError y subclases)
```

- API versionada: `/api/v1`.
- Endpoint implementado: `GET /api/v1/health` → `{ status, timestamp, uptime }`.
- `express.json({ limit: '100kb' })` (límite de peticiones).
- Imports con extensión `.js` (estándar NodeNext para build con `tsc`).

## Archivos creados

- `app/backend/package.json`, `package-lock.json`
- `app/backend/tsconfig.json` (TypeScript estricto)
- `app/backend/vitest.config.ts`
- `app/backend/.env.example`
- `app/backend/.gitignore`
- `app/backend/README.md`
- `app/backend/src/server.ts`
- `app/backend/src/app.ts`
- `app/backend/src/config/env.ts`
- `app/backend/src/utils/httpError.ts`
- `app/backend/src/middleware/rateLimit.ts`
- `app/backend/src/middleware/error.middleware.ts`
- `app/backend/src/routes/index.ts`
- `app/backend/src/routes/health.routes.ts`
- `app/backend/src/controllers/health.controller.ts`
- `app/backend/src/services/health.service.ts`
- `app/backend/src/health.test.ts`
- `docs/modules/MODULO-3-BACKEND-BASE.md`

## Archivos modificados

- `app/backend/.gitkeep` (eliminado por el scaffold)

## Dependencias

- **express**: servidor HTTP.
- **zod**: validación de entorno y futuras entradas.
- **helmet**: cabeceras de seguridad.
- **cors**: accesos restringidos.
- **express-rate-limit**: límite de peticiones.
- **dotenv**: variables de entorno desde `.env`.
- Dev: **typescript**, **@types/node**, **@types/express**, **@types/cors**, **supertest**, **@types/supertest**, **tsx** (dev), **vitest**, **oxlint**.

## API

- `GET /api/v1/health` → `200 { status: 'ok', timestamp, uptime }`
- Rutas inexistentes → `404 { error: { message, code } }`
- Error no controlado → `500 { error: { message, code: 'INTERNAL_ERROR' } }` (sin stack traces).

**No se implementan** endpoints de chat, auth ni datos de negocio (módulos posteriores).

## Base de datos

Ninguna todavía. La capa de repositorios y Prisma llegan en el Módulo 4.

## Seguridad

- Helmet activo, CORS con orígenes configurables (`CORS_ORIGIN`), rate limit general (100 req / 15 min), límite de cuerpo JSON (100kb).
- Los errores nunca exponen detalles internos ni stack traces.
- Secretos y configuración via variables de entorno (`.env` / `.env.example`, nunca en Git).
- Se añadirán validaciones Zod por endpoint en los módulos funcionales.

## Testing

```text
npm run lint       → oxlint, sin errores
npm run typecheck  → tsc --noEmit, sin errores
npm test           → Vitest + Supertest, 2 pruebas pasan
npm run build      → tsc, dist/ generado (smoke test manual: GET /api/v1/health = 200)
```

Pruebas: `GET /api/v1/health` responde 200 con formato correcto; rutas inexistentes devuelven 404 con estructura de error.

## Git

Commits locales por archivo/unidad. Push: NO REALIZADO.

## Problemas

- Typecheck fallaba con imports con extensión `.ts` (`TS5097`, exige `noEmit`). Solución: convención NodeNext con imports `./archivo.js` (tsc emite dist/ sin problema).
- Hook de esbuild (tsx) bloqueado por `npm approve-scripts`; no afecta la ejecución (binario ya instalado).

## Soluciones

Ver sección problemas.

## Cómo modificarlo

- Nuevo endpoint: crear `routes/X.routes.ts`, `controllers/X.controller.ts`, `services/X.service.ts` y registrar en `routes/index.ts`.
- Nuevos errores: subclase de `AppError` en `utils/httpError.ts` (o lanzar las existentes).
- Variables de entorno nuevas: agregar al esquema en `config/env.ts` y a `.env.example`.
- Pruebas: archivos `*.test.ts` con Supertest contra `createApp()`.