# Módulo 12 — Autenticación

## Qué se hizo
Login administrativo con sesión **server-side** (`express-session` + store persistente en Postgres vía Prisma, cookie `httpOnly`), página de login global (`/login`) y ruta protegida placeholder `/admin` (el panel real es Módulo 13). El visitante sigue sin necesitar login para navegar.

## Decisiones previas (ADR)
- **ADR-003**: store propio `PrismaSessionStore` sobre la tabla `Session` (nada de MemoryStore), bcryptjs con **cost factor 12**.
- **ADR-004**: cookie `sid` con `httpOnly`, `sameSite: 'lax'`, `secure: 'auto'`, `maxAge` 12h, `trust proxy` en producción; comportamiento según escenario de deploy (mismo origen vs orígenes distintos: `SameSite=None`+Secure y CORS con credentials se deciden en Módulo 17).

## Arquitectura

```
Login (frontend) → POST /api/v1/auth/login → AuthController → AuthService → UserRepository → Prisma
                        ↓ (bcrypt.compare, cost 12)
                req.session.user = { id, email, role }   (Persistida por PrismaSessionStore en tabla Session)
```

- **Sesión**: `express-session` con store `PrismaSessionStore` (`get`, `set`, `destroy`, `touch`; serializa a JSON en `Session.data`, limpieza de expiradas cada 15 min).
- **Hash**: `bcryptjs`, rounds `BCRYPT_ROUNDS = 12` (mayor coste mitigado por `authLimiter` 5 intentos/15 min).
- **Anti-enumeración**: el mismo mensaje `Correo o contraseña incorrectos` para usuario inexistente y contraseña errónea (401).
- **Cookie** (ADR-004): `name: 'sid'`, `httpOnly: true`, `sameSite: 'lax'`, `secure: 'auto'`, `maxAge: 12h`; `app.set('trust proxy', 1)` solo en producción.

## Archivos creados / modificados

### Backend
| Archivo | Descripción |
|---------|-------------|
| `prisma/schema.prisma` | Modelo `Session` (Role y User ya existían) |
| `prisma/migrations/20260914233527_add_session_table/` | Migración |
| `prisma/seed.ts` | Rol `admin` + usuario admin desde `ADMIN_EMAIL`/`ADMIN_PASSWORD` (hash 12) |
| `src/config/env.ts` | `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`; guard de desarrollo en producción |
| `src/schemas/auth.schema.ts` | `loginSchema` (email lowercased + password) |
| `src/lib/sessionStore.ts` | `PrismaSessionStore` |
| `src/types/express-session.d.ts` | `SessionData.user` tipado |
| `src/repositories/user.repository.ts` | `findByEmail` con role |
| `src/services/auth.service.ts` | `verifyCredentials` + `BCRYPT_ROUNDS` |
| `src/controllers/auth.controller.ts` | `loginHandler`, `logoutHandler`, `meHandler` |
| `src/middleware/requireAuth.ts` | Guard 401 si no hay sesión |
| `src/middleware/rateLimit.ts` | `authLimiter` 5/15min |
| `src/routes/auth.routes.ts` + `index.ts` | registro `/auth` (login público; me/logout protegidos) |
| `src/app.ts` | Middleware de sesión + trust proxy |
| `src/auth.test.ts` | 7 tests |

### Frontend
| Archivo | Descripción |
|---------|-------------|
| `src/lib/auth.ts` | `login`, `getCurrentUser`, `logout` (siempre `credentials: 'include'`, ADR-004) |
| `src/pages/Login.tsx` | Formulario Pulcritud Verde, redirige si ya hay sesión |
| `src/components/ProtectedRoute.tsx` | Guard: 401 → redirige a `/login` |
| `src/pages/Admin.tsx` | Placeholder protegido + botón cerrar sesión (panel real M13) |
| `src/App.tsx` | Rutas `login` (standalone) y `admin` (protegida) |
| `src/pages/Login.test.tsx` | 3 tests |

## Endpoints
```
POST /api/v1/auth/login    → 200 { user: { id, email, role } } · 401 · 400 · 429 (limit)
GET  /api/v1/auth/me       → 200 { user } · 401            (requiere sesión)
POST /api/v1/auth/logout   → 204 + borra cookie            (requiere sesión)
```

## Seguridad
- Secretos solo en `.env` / `.env.example` (placeholders); `SESSION_SECRET`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` **no** pueden usar valores de desarrollo en producción (validado al boot).
- Hash bcrypt 12, mensajes genéricos de login, rate limiting 5/15min, cookie httpOnly + sameSite lax, CORS restringido, Helmet.
- ⚠️ Prisma CLI (dev-dependency) arrastra `deepmerge-ts` y `mysql2` con avisos `high`; el fix exigiría downgrade breaking a Prisma 6. Revisar en Módulo 15 (Seguridad).

## Testing
- Backend 8 archivos / 26 tests ✅ (7 de auth con agente + cookie).
- Frontend 5 archivos / 16 tests ✅ + build OK (chunk `Resenas` intacto).
- Smoke real: login 200 → me 200 → logout 204 → me 401 ✅.

## Cómo modificar
- **Nuevo rol**: añadir fila en `Role` (seed o admin) — el guard actual solo comprueba sesión activa.
- **Cambiar duración de sesión**: `maxAge` del `cookie` en `app.ts`.
- **Bloquear a un usuario**: borrar sus sesiones en la tabla `sessions` (o en el panel M13).
- **Escenario de deploy de orígenes distintos**: seguir ADR-004 (cambiar `sameSite: 'none'` y CORS credentials en Módulo 17).