# Módulo 15 — Seguridad

## Qué se hizo
Endurecimiento de seguridad del backend **sin agregar dependencias** y **sin romper los tests ni los consumidores tipo curl/mismo-origen**: (1) mitigación CSRF mediante validación del encabezado `Origin` en **todos** los métodos mutantes del API v1 (middleware global, no lista fija de rutas), (2) regeneración del `sid` en cada login (anti session-fixation), (3) headers `X-Robots-Tag: noindex` + `Cache-Control: no-store` en rutas sensibles (admin y login), (4) CSP explícita `img-src` para la galería externa, (5) informe de `npm audit` documentado (4 high dev-only del CLI de Prisma; runtime producción y frontend en 0) y (6) test suite de seguridad (11 tests nuevos).

## Decisiones del usuario (ajustes en esta sesión)
- **D1**: `requireSameOrigin` aplica **solo** a `POST/PUT/PATCH/DELETE`; **nunca** a `GET` (verificado en test: GET con Origin malicioso responde 200/401, nunca 403).
- **D2**: se aplica como **middleware global** montado en `/api/v1` antes del router (no como lista de rutas), de modo que **cualquier endpoint mutante futuro queda cubierto automáticamente** (incluye `auth/logout`, contacto, jobs, galería, admin).
- **D3**: en el ADR-005 queda nota explícita: la CSP configurada aquí es **solo para las respuestas JSON del backend**; la protección XSS de la SPA (CSP de la página que ve el usuario) **queda pendiente para el Módulo 17**, vía meta tag en `index.html` o headers del hosting del frontend.
- Aprobación D1/D2/D3 del plan: se procede con el resto tal cual.

## Arquitectura

```
request mutante (POST/PUT/PATCH/DELETE) → app.use('/api/v1', generalLimiter, requireSameOrigin, apiRouter)
      ├─ sin header Origin (curl, mismo origen, tests)  → adelante (compat)
      ├─ CORS_ORIGIN='*' (dev)                         → adelante (sin validar)
      └─ Origin presente y CORS_ORIGIN concreta        → debe coincidir; si no → 403 AuthorizationError

login → verifyCredentials → req.session.regenerate() (sid nuevo) → req.session.user = {...}

rutas sensibles:
  adminRouter.use(noStoreHeaders, noIndexHeaders, requireAuth, requireAdmin)
  auth: login → noStoreHeaders + noIndexHeaders ; /me y /logout → noStoreHeaders (tras requireAuth)

helmet CSP → directives.imgSrc = ["'self'", 'data:', 'https:']   (JSON del backend)
```

- `requireSameOrigin` (`src/middleware/requireSameOrigin.ts`): lee `CORS_ORIGIN` de `env`; separa por comas; normaliza por `new URL(x).origin`.

## Archivos creados / modificados

### Backend
- `src/middleware/requireSameOrigin.ts` (nuevo): middleware CSRF por `Origin`, solo métodos mutantes, global.
- `src/middleware/securityHeaders.ts` (nuevo): `noStoreHeaders` (`Cache-Control: no-store`) y `noIndexHeaders` (`X-Robots-Tag: noindex, nofollow`).
- `src/app.ts`: helmet con `contentSecurityPolicy.directives.imgSrc` explícito; montaje global `requireSameOrigin` en `/api/v1` entre `generalLimiter` y `apiRouter`.
- `src/controllers/auth.controller.ts`: `req.session.regenerate()` envuelto en Promesa antes de fijar el usuario (mitiga fijación de sesión).
- `src/routes/auth.routes.ts`: `no-store` + `noindex` en `/login`; `no-store` en `/me` y `/logout`.
- `src/routes/admin.routes.ts`: `no-store` + `noindex` ANTES de los guards `requireAuth`/`requireAdmin` (las respuestas 401 también salen con esos headers).
- `src/security.test.ts` (nuevo): 11 tests (origin rechazado/aceptado/ausente en public, admin y PATCH; GET nunca 403; sid cambia entre logins; headers en admin/login/me; CSP `img-src` presente).
- `vitest.config.ts`: `env: { CORS_ORIGIN: 'http://localhost:5173' }` para la suite (los demás tests no envían `Origin`, no se ven afectados).

### Frontend
- Nada: solo se verificó que el cliente ya envía `credentials: 'include'` en `src/lib/auth.ts` (sin cambios).

### Docs
- `docs/decisions/ADR-005-seguridad-m15-csrf-sesion-csp.md` (nuevo): decisiones D1–D5 + la **nota explícita del CSP de la SPA pendiente para M17**.
- `.env.example` (backend): documentación de `CORS_ORIGIN` en producción.

## Seguridad
- CSRF mitigado por `Origin` a nivel global (sin dependencias). `SameSite=Lax` sigue como segunda capa; si el escenario B del M17 exige `SameSite=None`, se revisará la validez del chequeo de `Origin` (puede exigir permitir el origen del frontend explícitamente).
- Session fixation: `sid` nuevo en cada login (el anterior queda invalidado).
- Los endpoints admin y de login no se cachean (`no-store`) y se marcan como no indexables para robots.
- `npm audit`: 4 high **dev-only** del CLI de Prisma (`prisma@7.10.0` → `@prisma/config@7.10.0` → `deepmerge-ts@7.1.5`; `prisma` → `mysql2@3.15.3`). **No** se ejecutó `npm audit fix --force` (obliga a downgrade breaking a Prisma 6). Runtime de producción: 0 vulnerabilidades. Frontend: 0 vulnerabilidades. Ver `src/security.test.ts` para cobertura.
- **Ajuste pedido por el usuario tras el cierre**: `CORS_ORIGIN` **nunca** puede ser `*` en producción (anularía toda la protección CSRF del módulo). Ahora `env.ts` **rechaza `CORS_ORIGIN=*` en producción y el backend no arranca** (fail-closed en startup), con tests en `src/env.test.ts`.

## Testing
- `npm test`: **63/63 tests** (13 archivos, secuencial) ✅. Nuevo `security.test.ts` (11 tests) ✅.
- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅.
- Ejecutarla borra la empresa real (suite completa): tras tests, restaurar con `npm run db:seed`.

## Git (commits planificados, por capa)
1. `feat: add requireSameOrigin middleware for csrf on mutating methods`
2. `feat: add noStore and noIndex security header middleware`
3. `feat: enforce same-origin globally on api v1 and scope csp img-src`
4. `feat: regenerate session id on login to prevent session fixation`
5. `feat: apply no-cache and robots headers to admin and auth routes`
6. `test: add security regression tests for origin session and headers`
7. `docs: add security module doc and ADR-005 for csrf session csp`
8. `chore: document CORS_ORIGIN in backend env example`
9. `feat: reject wildcard CORS_ORIGIN in production to keep csrf protection`
10. `test: add env schema regression tests for production guards`
11. `docs: document production rejection of wildcard cors origin`

## Pendientes / observaciones
- **CSP de la SPA queda pendiente para el Módulo 17** (meta tag o headers del hosting del frontend) — ver ADR-005.
- `CORS_ORIGIN` debe fijarse exacto en producción (sin `*`), o `requireSameOrigin` degrada a "bloquear todas las mutaciones".
- Revisar las advisories de Prisma al instalar su próxima versión (el fix real es en `deepmerge-ts`/`mysql2` que arrastra el CLI).