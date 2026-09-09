# MÓDULO 4 — POSTGRESQL + PRISMA

## Qué se hizo

Se conectó el backend a PostgreSQL real (instalado localmente, versión 17) mediante Prisma 7. Se creó la base `highclean` con un usuario dedicado, el esquema de datos con las entidades planificadas, la migración inicial y el cliente singleton. El endpoint de salud ahora reporta el estado de la base de datos.

## Por qué

Era el siguiente módulo del plan y habilita los módulos funcionales (5–10) que necesitan persistencia.

## Arquitectura

```text
services/health.service.ts
  ↓
lib/prisma.ts (singleton PrismaClient + driver adapter @prisma/adapter-pg)
  ↓
prisma/schema.prisma (datasource PostgreSQL, 7 entidades)
  ↓
PostgreSQL 17 (DB "highclean", rol "highclean")
```

- **Prisma 7**: practica actual — el `url` vive en `prisma.config.ts` (para Migrate) y el cliente se construye con un **driver adapter** (`@prisma/adapter-pg`).
- Entidades y relaciones (mínimas, según la sección 5 del prompt):

| Entidad | Relaciones |
|---|---|
| `Role` | 1 → N `User` |
| `User` | N → 1 `Role` |
| `Company` | 1 → N `Service`, `Review`, `GalleryImage`, `ContactMessage` |
| `Service` | N → 1 `Company` |
| `Review` | N → 1 `Company` · enum `ReviewStatus` `PENDING/APPROVED/REJECTED` |
| `ContactMessage` | N → 1 `Company` |
| `GalleryImage` | N → 1 `Company` |

- Slugs y campos opcionales (`description`, `phone`, `email`, etc.) quedan preparados para los módulos 5–9.

## Archivos creados

- `app/backend/.env` (local, NO versionado)
- `app/backend/.env.example` (actualizado con `DATABASE_URL`)
- `app/backend/prisma/schema.prisma`
- `app/backend/prisma/migrations/20260909005658_init/migration.sql`
- `app/backend/prisma.config.ts`
- `app/backend/src/lib/prisma.ts`
- `docs/modules/MODULO-4-POSTGRESQL-PRISMA.md`
- `src/generated/prisma/` (código generado, NO versionado)

## Archivos modificados

- `app/backend/package.json` + `package-lock.json` (Prisma + adapter pg)
- `app/backend/tsconfig` se mantiene; `vitest.config.ts` (include `src/**/*.test.ts`)
- `app/backend/src/config/env.ts` (validación de `DATABASE_URL`)
- `app/backend/src/services/health.service.ts` (ping a BD)
- `app/backend/src/controllers/health.controller.ts` (async)
- `app/backend/src/health.test.ts` (verifica `database: 'up'`)
- `app/backend/.gitignore` (`src/generated/`)

## Dependencias

- **@prisma/client** y **prisma** (CLI): ORM.
- **@prisma/adapter-pg** y **pg**: driver adapter para PostgreSQL.
- (las demás del proyecto no cambiaron)

## API

Solo cambia `GET /api/v1/health`: ahora responde `{ status, database: 'up'|'down', timestamp, uptime }`.

## Base de datos

- Base `highclean` + rol `highclean` creados en PostgreSQL 17 local (permisos `LOGIN` + `CREATEDB` para el shadow database de Prisma Migrate).
- 7 tablas creadas por migración `init`. Documentación de entidades y relaciones arriba.

## Seguridad

- Credenciales SOLO en `.env` local (`.env` y `src/generated/` en `.gitignore`).
- `DATABASE_URL` estándar → permite cambiar de proveedor sin tocar código (regla 12 del prompt).
- El health nunca expone credenciales ni detalles internos.

## Testing

```text
npm run lint       ✅ oxlint
npm run typecheck  ✅ tsc --noEmit
npm test           ✅ Vitest+Supertest: 2 pruebas (health con database 'up', 404)
npm run build      ✅ tsc → dist/
Smoke test real: GET /api/v1/health → 200 { status: ok, database: up }
```

## Git

- Commits locales por archivo. Push: NO REALIZADO.
- Verificado: `.env` y `src/generated/` no quedan trackeados.

## Problemas

1. Prisma 7 eliminó `url` del schema y exige driver adapter: error de validación al generar. Solución: `prisma.config.ts` con `datasource.url` + `@prisma/adapter-pg` en el cliente.
2. `npm install -D prisma` instaló una versión RC (8.0.0-rc) incompatible. Solución: fijar `prisma@^7.10.0`.
3. Role `highclean` sin permiso `CREATEDB` → error P3014 (shadow database). Solución: `ALTER ROLE highclean CREATEDB`.
4. Vitest recogía `dist/health.test.js` de un build anterior. Solución: `include: ['src/**/*.test.ts']`.

## Soluciones

Ver sección problemas.

## Cómo modificarlo

- Cambiar el esquema: editar `prisma/schema.prisma` → `npm run db:migrate -- --name nombre`.
- Regenerar el cliente: `npm run db:generate`.
- Aplicar migraciones pendientes en servidores: `npm run db:deploy`.
- Persistencia nueva en código: usar `prisma` desde `src/lib/prisma.ts`.