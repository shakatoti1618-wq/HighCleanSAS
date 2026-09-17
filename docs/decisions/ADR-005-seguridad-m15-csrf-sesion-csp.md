# ADR-005 — Seguridad Módulo 15: CSRF por Origin, regeneración de sesión, headers y CSP (alcance backend)

## Contexto

El Módulo 15 endurece la seguridad del backend. Estado previo: helmet(), CORS configurable, rate limiters, Zod, honeypot, bcryptjs, sesión `httpOnly / sameSite='lax' / secure='auto'`, errores centralizados. Gaps detectados: (a) el login no regeneraba el `sid` (fijación de sesión), (b) no había validación del encabezado `Origin` en las mutaciones (CSRF/lógica CSRF), (c) la CSP no contemplaba las URLs externas de la galería, (d) faltaban headers `X-Robots-Tag`/`Cache-Control` en rutas sensibles, (e) `npm audit` reportaba 4 advisories high dev-only del CLI de Prisma.

## Problema

¿Cómo mitigar CSRF y fijación de sesión sin agregar dependencias y sin romper los tests existentes (que no envían `Origin`) ni los consumidores tipo `curl`?

## Alternativas

1. Middleware CSRF basado en token (`csurf`/casero). Más robusto contra CSRF con credenciales, pero agrega fricción a cada mutación (tokens por sesión), migración en el SPA y depende del estado de sesión (fallaría en escenarios sin sesión).
2. Validación del encabezado `Origin` (CSRF "moderno"). Sin dependencias, se apoya en que los navegadores siempre envían `Origin` en mutaciones cross-site y en la mayoría de las mismas; no afecta a `curl`/tests sin `Origin`.
3. No hacer nada y confiar en `SameSite=Lax` (que bloquea cookies en POST cross-site) — no cubre login CSRF ni mutaciones sin cookie.

## Decisión

- **D1 — CSRF por `Origin` (opción 2)**: middleware global `requireSameOrigin` montado en `/api/v1` que aplica **solo** a `POST/PUT/PATCH/DELETE` (nunca a `GET`). Regla: si el header `Origin` está presente debe coincidir con `CORS_ORIGIN` (lista separada por comas); si no viene (curl, mismo origen, tests) se permite. Si `CORS_ORIGIN === '*'` (dev) no se valida. Respuesta de rechazo: `403 AuthorizationError`. Aplica a **todo** endpoint mutante, incluidos los futuros: al montarse globalmente antes del router, cualquier ruta nueva queda cubierta automáticamente sin lista fija.
- **D2 — Dependencias**: no se toca nada (`npm audit fix --force` forzaría un downgrade breaking a Prisma 6). Las 4 high son del CLI de Prisma (devDependency): `deepmerge-ts@7.1.5` (exhaustion) y `mysql2@3.15.3` (2 advisories) vía `prisma` → `@prisma/config`. El runtime de producción (`@prisma/client` + `pg` + driver adapter) tiene **0** vulnerabilidades; frontend **0**. Se documenta y se monitorea (revisar al instalar actualizaciones de Prisma).
- **D3 — CSP `img-src` ampliado**: `imgSrc: ["'self'", 'data:', 'https:']` (resto de directivas = defaults de helmet) para permitir imágenes de la galería alojadas en cualquier host https.
- **D4 — Fijación de sesión**: `req.session.regenerate()` en `loginHandler` antes de fijar `req.session.user`, emitiendo un `sid` nuevo en cada login.
- **D5 — Headers en rutas sensibles**: `noStoreHeaders` (`Cache-Control: no-store`) y `noIndexHeaders` (`X-Robots-Tag: noindex, nofollow`) en el router admin (antes de los guards de auth, para que también apliquen a respuestas 401) y en `/auth/login`; `no-store` en `/me` y `/logout`.

## Consecuencias

- Todo endpoint mutante del API v1 queda protegido por `Origin` sin mantenimiento de listas. Un origen mal configurado en `CORS_ORIGIN` en producción degrada a "bloquear todo" (fail closed) en mutaciones, lo que obliga a fijar `CORS_ORIGIN` exacto en producción (ya era requerido por `AD-004`).
- El `sid` cambia en cada login: cualquier token de sesión antiguo queda invalidado (mitiga session fixation).
- **NOTA ADR (requerida por el usuario) — la CSP de este módulo es SOLO para las respuestas JSON del backend**: la SPA está alojada y servida por Vite/frontend host, y helmet no aplica headers a `index.html` del frontend. La protección XSS de la página que ve el usuario (CSP real de la SPA) **queda pendiente para el Módulo 17 (Deploy)**, vía `<meta http-equiv="Content-Security-Policy">` en `index.html` o headers del hosting del frontend. No está resuelto todavía: la decisión de dónde vive la SPA (mismo origen vs. distinto) determina el mecanismo.
- La suite de tests fija `CORS_ORIGIN=http://localhost:5173` en `vitest.config.ts` (los tests existentes no envían `Origin`, por lo que no se ven afectados) y agrega `security.test.ts` (11 tests).

## Estado

Aprobado por el usuario (D1, D2 y D3 con los ajustes solicitados: solo métodos mutantes, middleware global, nota SPA CSP para M17). Ver `docs/modules/MODULO-15-SEGURIDAD.md`.