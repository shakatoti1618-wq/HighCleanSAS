# MÓDULO EXTRA — Cambio de contraseña + seguridad/UX en login

> Módulo extra solicitado por Jonathan. El número **18 queda reservado** en el prompt
> maestro para finalizar `Módulo 18 — Google Search Console + indexación` (después del
> deploy), por eso este módulo se numera como "EXTRA".

## Qué se hizo

1. **Backend — nuevo endpoint `PATCH /api/v1/auth/password`** (protegido por
   `requireAuth`, con headers `no-store/noindex`). Valida la **contraseña actual** contra
   el hash (bcrypt) antes de aceptar la nueva; hashea la nueva con `bcryptjs` y los mismos
   `BCRYPT_ROUNDS = 12` que usa el seed; y **cierra la sesión actual** (destroy +
   `clearCookie('sid')`) para forzar volver a iniciar sesión.
2. **Política de contraseña**: mínimo **12 caracteres**, al menos **una letra y un
   número**. Se aplica en un schema zod reutilizable (`passwordSchema`) usado por el
   endpoint **y** por la validación de `ADMIN_PASSWORD` en `env.ts` (antes solo exigía 12
   caracteres). Errores claros: "La contraseña debe tener al menos 12 caracteres e incluir
   letras y números".
3. **Frontend — toggle mostrar/ocultar**: nuevo componente reutilizable `PasswordField`
   con ícono de ojo (`Eye`/`EyeOff`) que alterna `type="password"`/`type="text"`. Se usa en
   `Login` y en el formulario nuevo. No se registra ni expone el valor.
4. **Frontend — sección "Cuenta"** en el panel admin (`/admin/cuenta`): formulario de
   cambio de contraseña (actual / nueva / confirmar) con la misma validación cliente,
   mensajes claros y redirección a `/login` con aviso verde al cambiar (porque la sesión
   se cierra en el servidor). Protegida igual que el resto del panel (no se tocó nada de
   `requireAuth`/`requireAdmin` ni del logout).

## Por qué

- Cierra la brecha de gestión de credenciales: hoy el admin no podía cambiar su
  contraseña sin editar la BD. La rotación de credenciales es una práctica de seguridad
  básica (OWASP) y el cierre de sesión evita sesiones huérfanas tras el cambio.
- La validación de `ADMIN_PASSWORD` (el dato con el que nace el admin vía seed) debía
  cumplir la misma política que el runtime, para no tener dos criterios distintos.

## Arquitectura

- Backend sigue el patrón de capas: Route → Controller → Service → Repository → Prisma.
  `PATCH /api/v1/auth/password` mete en la cadena: `changePasswordSchema` → router
  `auth.routes.ts` → `changePasswordHandler` → `auth.service.changePassword()` →
  `user.repository.{findById,updatePassword}`.
- La política de contraseña vive en **un solo lugar** (`schemas/auth.schema.ts`:
  `passwordSchema` + `PASSWORD_POLICY_MESSAGE`) y se importa también en `env.ts` para
  `ADMIN_PASSWORD` (mismo mensaje).
- El cierre de sesión usa el `PrismaSessionStore` existente: `session.destroy` borra la
  fila `Session` actual; `clearCookie('sid')` invalida la cookie en el navegador.
- Frontend: `PasswordField` encapsula label-less input + toggle; la sección "Cuenta" se
  registró en `App.tsx` (ruta) y `AdminLayout.tsx` (nav con ícono `UserRound`).

## Archivos creados/modificados

| Archivo | Tipo |
| --- | --- |
| `app/backend/src/schemas/auth.schema.ts` | Modificado — `passwordSchema`, `changePasswordSchema`, `PASSWORD_POLICY_MESSAGE` |
| `app/backend/src/config/env.ts` | Modificado — `ADMIN_PASSWORD` usa la política (12 + letra + número) |
| `app/backend/src/repositories/user.repository.ts` | Modificado — `findById`, `updatePassword` |
| `app/backend/src/services/auth.service.ts` | Modificado — `changePassword` |
| `app/backend/src/controllers/auth.controller.ts` | Modificado — `changePasswordHandler` (destruye sesión) |
| `app/backend/src/routes/auth.routes.ts` | Modificado — `PATCH /password` |
| `app/backend/src/auth.test.ts` | Modificado — 4 tests del endpoint |
| `app/backend/src/env.test.ts` | Modificado — 2 tests de política `ADMIN_PASSWORD` |
| `app/frontend/src/components/fields/PasswordField.tsx` | Nuevo — input con toggle de ojo reutilizable |
| `app/frontend/src/pages/Login.tsx` | Modificado — toggle de ojo + aviso de notificación (`location.state.notice`) |
| `app/frontend/src/lib/admin.ts` | Modificado — `changePassword` (cliente) |
| `app/frontend/src/pages/admin/Cuenta.tsx` | Nuevo — sección "Cuenta" con el formulario |
| `app/frontend/src/components/AdminLayout.tsx` | Modificado — item nav "Cuenta" (`UserRound`) |
| `app/frontend/src/App.tsx` | Modificado — ruta `/admin/cuenta` |
| `docs/modules/MODULO-EXTRA-CAMBIO-CONTRASENA-SEGURIDAD-LOGIN.md` | Nuevo — este documento |

## Dependencias

- Ninguna nueva. `bcryptjs`, `zod` y `lucide-react` (íconos `Eye`/`EyeOff`, `KeyRound`) ya
  estaban en el proyecto.

## API

- `PATCH /api/v1/auth/password` (requiere sesión):
  - Request: `{ "currentPassword": string, "newPassword": string }`.
  - 200 `{ message }` → sesión destruida, cookie borrada.
  - 400 `ValidationError` si falta la actual o la nueva no cumple la política.
  - 401 `AuthenticationError` si no hay sesión o la contraseña actual es incorrecta.
  - 404 `NotFoundError` si el usuario de la sesión ya no existe (borde).

## Base de datos

- **Sin migraciones**: se actualiza `User.passwordHash` y se borra la fila `Session`
  actual vía el store existente.

## Seguridad

- La contraseña nunca viaja en logs ni en `req.session`.
- La comparación usa `bcrypt.compare` (nunca se compara texto plano).
- Al cambiar la contraseña se **destruye la sesión del navegador actual**; otras sesiones
  de otros dispositivos quedan activas (documentado como mejora futura: invalidar todas).
- El toggle de visibilidad es **solo cliente** (no envía ni almacena nada; solo alterna el
  `type` del input). `autoComplete` correcto (`current-password` / `new-password`).
- El guard de `env.ts` sigue exigiendo en producción contraseñas que cumplan la política y
  rechaza el default de desarrollo.

## Testing / verificación

- Backend: **83/83** tests (eran 77 → +6: 401 sin sesión, 401 contraseña equivocada, 400
  por política ×4 casos, cambio exitoso con sesión cerrada y login con la nueva).
- Frontend: **54/54** tests, `lint` + `typecheck` + `build` óptimos en ambos.
- Un test de ChatWidget dio timeout de 5 s en la primera corrida completa (entorno jsdom
  cargado, servidores dev en paralelo); aislado pasa 4/4 y la suite completa quedó en
  verde en segunda corrida. No está relacionado con este módulo.
- Smoke manual recomendado: login → `/admin/cuenta` → cambiar contraseña → redirige a
  `/login` con aviso → login con la nueva funciona; con la vieja, 401.

## Git

Commits atómicos por capa (estilo 17.1). **No se hace push sin autorización explícita.**

## Cómo modificar este módulo

- Endurecer la política → tocar solo `passwordSchema` en `schemas/auth.schema.ts`
  (el mensaje y las validaciones de env y del frontend se actualizan desde allí o por
  duplicado intencional en `Cuenta.tsx`).
- Invalidar todas las sesiones al cambiar la contraseña → iterar `Session` del store y
  borrar las filas del usuario (mejora futura documentada).
- Reubicar el formulario → la sección "Cuenta" es una página admin más; no tiene
  dependencia con el navbar salvo `AdminLayout`/`App.tsx`.