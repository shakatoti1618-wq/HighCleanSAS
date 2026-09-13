# MÓDULO 9 — CONTACTO

## Qué se hizo

Se implementa el formulario de contacto funcional de punta a punta:

**Backend** — `POST /api/v1/contact` por capas (route → controller → service → repository):

- Validación con **Zod** (`contact.schema.ts`): `name` trim 1–100, `email` trim + formato email máx 254, `message` trim 1–5000. Inválido → `400` con `code: 'ValidationError'`. Los campos extra (desconocidos) se ignoran con el destructuring del honeypot.
- **Rate limit dedicado** `contactLimiter`: 5 peticiones / 15 min por IP (el general es 100/15). En `NODE_ENV=test` se omite para no romper los tests. Excedido → `429` con `code: 'RATE_LIMIT'`.
- **Honeypot anti-spam**: el controller extrae el campo oculto `website`; si viene relleno responde `201` falso (sin persistir) para que el bot crea que funcionó.
- El service resuelve la empresa con `findCompany()` y guarda el mensaje con su `companyId`.

**Frontend** — página `/contacto` (`Contacto.tsx`) ahora funcional:

- Envío real con estados `submitting` / `success` / `error` (spinner `Loader2`, mensajes de éxito `CheckCircle2` y de error `role="alert"`).
- **Honeypot accesible**: input oculto con `aria-hidden="true"`, `tabindex="-1"` y `autocomplete="off"` (no interfiere con teclado ni lectores de pantalla). Envuelto en `sr-only` para invisibilidad visual sin romper la accesibilidad.
- La página carga los datos reales de empresa (`fetchCompany()`) para teléfono, correo y dirección; si aún no hay datos usa el placeholder exacto.

## Por qué

Módulo funcional siguiente del plan (sección 25). El formulario existía visualmente desde la preview pero sin lógica de envío. Se añade el honeypot y el rate limit dedicado por ser protección OWASP explícita sobre `/contact` (sección Seguridad del prompt maestro). El caso "no existe empresa" **no** es un `DatabaseError` real: la BD respondió bien, solo falta el seed; por eso se lanza `409` con una nota/TODO en el código para revisar más adelante el código de error definitivo.

## Arquitectura

```text
POST /api/v1/contact  (contactLimiter 5/15min)
  ↓
routes/contact.routes.ts
  ↓
controllers/contact.controller.ts  (honeypot → zod safeParse → ValidationError 400)
  ↓
services/contact.service.ts  (findCompany → ConflictError 409 si no hay empresa)
  ↓
repositories/contact.repository.ts  (createContactMessage)
  ↓
lib/prisma.ts → PostgreSQL (tabla ContactMessage)
```

Frontend:

```text
pages/Contacto.tsx (formulario, estados, honeypot a11y)
   └── lib/api.ts → sendContactMessage() → fetch POST /api/v1/contact
   └── lib/api.ts → fetchCompany() → /api/v1/company (teléfono/correo/dirección)
```

## Archivos creados

Backend:

- `app/backend/src/schemas/contact.schema.ts`
- `app/backend/src/repositories/contact.repository.ts`
- `app/backend/src/services/contact.service.ts`
- `app/backend/src/controllers/contact.controller.ts`
- `app/backend/src/routes/contact.routes.ts`
- `app/backend/src/contact.test.ts`

Docs:

- `docs/modules/MODULO-9-CONTACTO.md`

## Archivos modificados

- `app/backend/src/middleware/rateLimit.ts` (nuevo `contactLimiter` 5/15 min, se omite en test)
- `app/backend/src/routes/index.ts` (registra `/contact`)
- `app/frontend/src/lib/api.ts` (`ContactMessageInput` + `sendContactMessage`)
- `app/frontend/src/pages/Contacto.tsx` (submit real + honeypot + datos de empresa)

## Dependencias

- Ninguna nueva (`zod` ya estaba instalado en el backend).

## API

- `POST /api/v1/contact` → `201` con el mensaje creado (`id`, `name`, `email`, `message`, `companyId`, `createdAt`).
- Body `{ name, email, message }`: `name` 1–100 (trim), `email` válido máx 254 (trim), `message` 1–5000 (trim).
- Errores: `400 ValidationError` (datos inválidos), `409 ConflictError` (empresa sin configurar, ver TODO en el service), `429 RATE_LIMIT` (más de 5 en 15 min).
- Honeypot: si el body trae `website` no vacío → `201` falso `{ id: null, createdAt }` sin guardar nada.

## Base de datos

- Tabla `ContactMessage` (relación con `Company`) — ya creada en la migración `init` del Módulo 4; **no hubo migración nueva**.
- El seed ya crea la empresa; si no existiera, el endpoint responde `409` con nota/TODO (no un 500 silencioso).

## Seguridad

- Rate limit exclusivo del formulario (5/15 min por IP) para mitigar spam/abuso.
- Honeypot invisible y accesible: captura bots sin afectar usuarios con teclado/lectores de pantalla.
- Validación estricta en el servidor con Zod (el frontend no es la frontera de seguridad).
- Validación en el `service`, no en el repository (los datos llegan ya validados desde el schema).
- Sin datos auxiliares que permitan enumeración ni inyección (el controller solo pasa los 3 campos del schema).

## Testing

```text
Backend: lint ✅ typecheck ✅ test ✅ (14 total; 4 nuevos de contacto) build ✅
Frontend: lint ✅ typecheck ✅ test ✅ (3) build ✅ (chunk Resenas separado)
Smoke: POST :3000/api/v1/contact → 201 (válido) · 201 id:null (honeypot) · 400 (email inválido)
```

Tests nuevos (`contact.test.ts`), con el mismo patrón de aislamiento de los módulos 6–8:

1. `201` y mensaje persistido (con trim de nombre).
2. `400` con email inválido.
3. `400` cuando falta el mensaje (solo espacios).
4. `201` falso sin guardar cuando el honeypot viene relleno.

**Aislamiento:** el `beforeEach` borra todos los mensajes de contacto (tabla hoja) y la empresa de prueba; el `afterEach` limpia la empresa de prueba. Igual que en reseñas/servicios/galería, correr los tests locales limpia la tabla `ContactMessage`; no hay seed de mensajes, así que no se pierde nada.

## Git

Commits atómicos por capa (sección 17.1), en orden:

```text
a602569 feat: add contact schema with zod validation
754629a feat: add contact repository layer
b18be2e feat: add contact service
357a088 feat: add contact controller
fbb228b feat: add contact rate limit middleware
c14feb9 feat: add contact route
27b9d37 feat: register contact route
9eea71e test: add contact endpoint tests
385f45c feat: add sendContactMessage to api lib
238552c feat: wire contact form submit with honeypot
```

Push: NO REALIZADO (se solicita autorización).

## Problemas

- El caso "empresa no configurada" no es un error real de la BD (la BD responde; falta el seed). Lanzarlo como 500 genérico era engañoso: se usa `409` con una nota/TODO en `contact.service.ts` para decidir el código definitivo más adelante.
- El smoke test inicial devolvió `500 INTERNAL_ERROR` por un artefacto del terminal (el JSON escapado por PowerShell llegaba malformado a body-parser), no por un bug del endpoint. Repetido con cuerpo real desde archivo, el endpoint responde correctamente.

## Soluciones

- Ver problemas. Además: el honeypot se hace visible solo para bots (campo no etiquetado para humanos) y se oculta con `sr-only` + `aria-hidden` + `tabindex="-1"` manteniendo la accesibilidad.

## Cómo modificarlo

- Ajustar la validación: `app/backend/src/schemas/contact.schema.ts`.
- Cambiar el límite del rate limit: `app/backend/src/middleware/rateLimit.ts` (`contactLimiter`).
- Cambiar el comportamiento del honeypot: `app/backend/src/controllers/contact.controller.ts`.
- Cambiar el mensaje de empresa no configurada: `app/backend/src/services/contact.service.ts` (revisar el TODO).
- Ajustar el formulario/estados: `app/frontend/src/pages/Contacto.tsx`.
- Los mensajes recibidos no se exponen públicamente todavía: verlos quedará para el panel admin (Módulo 13).