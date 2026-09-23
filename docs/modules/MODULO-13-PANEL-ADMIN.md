# Módulo 13 — Panel administrativo

## Qué se hizo
Panel administrativo completo con **shell dedicado con sidebar** (sin footer, chat ni WhatsApp), gestión CRUD de servicios, reseñas, mensajes, galería y postulaciones, edición de la información corporativa (descripción, misión, visión, **política de calidad** y **valores estructurados**), y una nueva página pública **"Trabaja con nosotros"** que recibe hojas de vida (PDF en PostgreSQL `Bytea`), exige **cargo obligatorio** y **autorización de datos personales (Ley 1581)**, y avisa por **correo vía Resend** cuando llega un mensaje o una postulación. Se añadió la página pública **Política de Tratamiento de Datos Personales** y el checklist legal pre-lanzamiento.

## Decisiones previas (usuario)
- **P1**: `values` pasa de texto a `Json` con hasta 20 objetos `{ name, description }` (7 valores sembrados con datos reales).
- **P2**: hojas de vida en **PostgreSQL Bytea** (no imágenes ni S3 en esta fase).
- **P3**: solo **PDF**, máximo **5 MB** (validado en `upload.ts` por mimetype + extensión).
- **P4**: el formulario pide **cargo obligatorio** (`position`), sin ciudad.

> ⚠️ **Nota de migración**: el cambio `values Text → Json` se incluyó en la migración `20260916001619_add_company_quality_policy` (se preveía una migración aparte). El `ALTER` de drop/recreate de la columna es inofensivo porque estaba vacía; queda documentado aquí.

- **P5**: panel con **shell dedicado** (`AdminLayout` con sidebar, sin footer/chat/WhatsApp); la sección "Empresa" edita `qualityPolicy` + `values`.
- **P6**: enlaces públicos en **footer + menú secundario** del navbar (no al mismo nivel que Servicios/Nosotros).
- **Ley 1581**: checkbox **obligatorio y no premarcado** en "Trabaja con nosotros" (el backend exige `consent` y guarda `dataConsentAcceptedAt`); checkbox **opcional no bloqueante** en `/contacto`. Textos cortos y sección larga (1–7) tomados textualmente del borrador del cliente (`Downloads/POLITICA-TRATAMIENTO-DATOS-BORRADOR.md`). Los `TODO` de correo/dirección/teléfono **se conservan** hasta que el cliente confirme.

## Arquitectura

```
"Trabaja con nosotros" (FormData) → POST /api/v1/jobs/apply → JobsController → AdminService.registerJobApplication
        │  multer (PDF ≤5MB) + jobsLimiter (3/15min) + honeypot + Zod (consent)      → JobApplicationRepository → Prisma (Bytea)
        └→ void notifyJobApplication() → ResendEmailProvider (EmailProvider)  [fire-and-forget; sin PDF en el correo]

Panel admin → /api/v1/admin/* → AdminController → AdminService → Repositories (service/review/contact/gallery/job/company)
        │   requireAuth + requireAdmin (rol 'admin')
Contacto   → POST /api/v1/contact → void notifyContactMessage()  (mismo patrón)
```

- **EmailProvider** (interfaz espejo de `ChatProvider`): `send()` exige `subject` + `text`/`html`. Implementación `ResendEmailProvider` con **no-op** si no hay `RESEND_API_KEY` (desarrollo/tests). Singleton por servicio.
- **Resend**: sender configurable vía `EMAIL_FROM` (env). En dev el default es `onboarding@resend.dev`; ⚠️ con ese sender Resend **solo entrega al correo dueño de la key**, así que en dev el `NOTIFY_EMAIL_CONTACT`/`NOTIFY_EMAIL_JOBS` de prueba debe ser ese correo. Con dominio verificado en Resend, `EMAIL_FROM=notificaciones@highcleansas.com` (M17) entrega a cualquier destinatario.
- **Notificación**: fire-and-forget (`void notify(...)` con try/catch interno). Un fallo del correo **nunca** pierde el registro ni bloquea la respuesta; sin datos sensibles en logs.
- **Descarga del CV**: `GET /api/v1/admin/jobs/:id/file` con `Content-Type`, `Content-Disposition: inline`, `Cache-Control: no-store`; el `fileData` nunca se expone en listados.

## BD (Prisma)
- `Company.qualityPolicy Json?` + `Company.values Json?` → se convierte a `Json?`.
- `ContactMessage.read Boolean default(false)` (ya existía la tabla).
- **Nuevo** `JobApplication`: `id`, `name`, `position`, `email`, `phone`, `message?`, `originalFileName`, `mimeType`, `fileSize Int`, `fileData Bytes`, `status NEW|REVIEWED`, `read`, `dataConsentAcceptedAt DateTime`, `createdAt`, `updatedAt`, `companyId` FK (índice en `status`). Migraciones `20260916001619` y `20260916001644`.

## Archivos creados / modificados

### Backend
| Archivo | Descripción |
|---------|-------------|
| `prisma/schema.prisma` + 2 migraciones | qualityPolicy/values `Json`, `ContactMessage.read`, modelo `JobApplication` |
| `src/providers/email.provider.ts` | Interfaz `EmailProvider` |
| `src/providers/resend.email-provider.ts` | Implementación Resend (no-op sin key) |
| `src/services/notification.service.ts` | `notifyContactMessage`, `notifyJobApplication` (fire-and-forget) |
| `src/config/env.ts` + `.env(.example)` | `RESEND_API_KEY` (obligatoria en prod), `NOTIFY_EMAIL` (default dev) |
| `src/schemas/admin.schema.ts` | `updateCompanySchema` (con `values` array validated), `createServiceSchema`, `updateServiceSchema`, `reviewStatusSchema`, `createGalleryImageSchema` |
| `src/schemas/jobs.schema.ts` | `jobFieldsSchema` (position obligatorio, phone regex, consent refine) |
| `src/middleware/upload.ts` | multer memory, PDF-only, ≤5MB, campo `cv`, `MulterError`→`ValidationError` |
| `src/middleware/requireAdmin.ts` | Guard 403 si el rol no es `admin` |
| `src/middleware/rateLimit.ts` | `jobsLimiter` 3/15min (skip en tests) |
| `src/repositories/{company,service,review,contact,gallery}.repository.ts` | CRUD admin ampliado (`updateCompany` con `UncheckedUpdateInput`) |
| `src/repositories/job-application.repository.ts` | create/findAll (sin fileData)/findFile/update/delete |
| `src/services/admin.service.ts` | dashboard, updateCompanyData, CRUD, `registerJobApplication` |
| `src/controllers/admin.controller.ts` | handlers (con `parseId` para Express 5) |
| `src/controllers/jobs.controller.ts` | honeypot, exige file, valida, registra, notifica, respuesta mínima |
| `src/routes/admin.routes.ts` + `jobs.routes.ts` + `index.ts` | registro `/admin` y `/jobs` |
| `src/providers/chat.provider.ts`, `knowledge.chat-provider.ts`, `services/chat.service.ts` | valores estructurados (`listValues`) para el chatbot |
| `prisma/seed.ts` | Datos reales: description 824, mission 621, vision 453, qualityPolicy 714, 7 values |
| `src/admin.test.ts`, `src/jobs.test.ts`, `src/email.test.ts` | tests nuevos (14) |

### Frontend
| Archivo | Descripción |
|---------|-------------|
| `src/lib/api.ts` | `Company` con `qualityPolicy` y `values: CompanyValue[]` |
| `src/lib/admin.ts` | Cliente tipado de `/api/v1/admin/*` (credentiales incluidas) |
| `src/lib/jobs.ts` | `applyJob` (FormData, sin `Content-Type` manual) |
| `src/components/DataConsentCheckbox.tsx` | Checkbox con texto corto + enlace a `/politica-de-datos` |
| `src/pages/TrabajaConNosotros.tsx` | Formulario público (cargo obligatorio, consent, honeypot, PDF) |
| `src/pages/PoliticaDeDatos.tsx` | Secciones 1–7 del borrador, verbatim, TODOs intactos |
| `src/pages/admin/{Resumen,Empresa,Servicios,Resenas,Mensajes,Galeria,Postulaciones}.tsx` | 7 secciones del panel |
| `src/components/AdminLayout.tsx` | Shell dedicado con sidebar (rápidos en móvil) + logout |
| `src/pages/Contacto.tsx` | Checkbox de consentimiento **opcional** |
| `src/pages/Nosotros.tsx` | Grid de valores + bloque "Política de calidad" |
| `src/components/{Navbar,Footer}.tsx` | Menú secundario e enlaces institucionales |
| `src/App.tsx` | Rutas admin anidadas fuera del Layout público + 2 rutas nuevas |
| `src/pages/Admin.tsx` | **Eliminado** (reemplazado por AdminLayout) |
| `src/pages/TrabajaConNosotros.test.tsx` | 4 tests (consent obligatorio antes del envío) |

## Endpoints
```
POST /api/v1/jobs/apply          → 201 { id, createdAt, status } · 400 · 429   (PDF ≤5MB + consent)
GET  /api/v1/admin/dashboard     → stats (servicios, reseñas, mensajes, galería, postulaciones)
PATCH /api/v1/admin/company      → actualiza description/mission/vision/qualityPolicy/values/contacto
GET/POST /api/v1/admin/services  · PATCH/DELETE /:id
GET  /api/v1/admin/reviews       · PATCH /:id {status} · DELETE /:id
GET  /api/v1/admin/messages      · PATCH /:id (leído) · DELETE /:id
GET/POST /api/v1/admin/gallery   · DELETE /:id
GET  /api/v1/admin/jobs          · GET /:id/file (PDF) · PATCH /:id (revisada) · DELETE /:id
```
Todos los `/admin/*` exigen sesión (`requireAuth`) y rol `admin` (`requireAdmin`).

## Seguridad
- Subida restringida a PDF ≤5 MB (mimetype + extensión, error limpio), rate limit 3/15min, honeypot anti-bot, Zod con `consent` obligatorio.
- CV en Bytea, solo descargable por admin autenticado; `fileData` fuera de los listados JSON.
- `RESEND_API_KEY` es **obligatoria en producción** (guard al boot); en dev sin key el envío es no-op.
- Sin datos personales en logs (el `warn` interno no loguea el contenido del correo).
- Misma base que M12 (Helmet, CORS, secretos solo .env).

## Testing
- Backend: 11 archivos / **51 tests** ✅ (14 nuevos: admin 12 + jobs 11 + email 1). Una corrida de tests borra la empresa real → recuperar con `npm run db:seed` (las suites crean y limpian su propia empresa dedicada para no depender del seed ni de otras suites).
- Frontend: **20 tests** ✅ (4 nuevos) + lint + typecheck + build OK.
- Smoke real: panel (login → resumen/empresa → nuevos mensajes/servicios) y postulación con PDF guardada en BD; correo Resend verificado cuando `RESEND_API_KEY` está configurada (en dev usar el correo dueño de la key en `NOTIFY_EMAIL_CONTACT`/`NOTIFY_EMAIL_JOBS`).

## Cómo modificar
- **Cambiar el texto del consentimiento**: `DataConsentCheckbox` (frontend) y, si cambia el texto, revisar `PENDIENTE-LEGAL-PRELANZAMIENTO.md` (los consentimientos viejos dejan de ser válidos).
- **Rellenar datos reales de contacto**: admin → Empresa, y reemplazar los TODOs de `PoliticaDeDatos.tsx`.
- **Límites de la subida**: `MAX_FILE_SIZE` y `ALLOWED_MIME` en `src/middleware/upload.ts`.
- **Email**: configurar `RESEND_API_KEY` más `NOTIFY_EMAIL_CONTACT` (cotizaciones) y `NOTIFY_EMAIL_JOBS` (hojas de vida); al tener dominio (M17) usar sender propio.
- **Nuevo rol admin**: el guard `requireAdmin` comprueba `role.name === 'admin'`.
- **Subida real de imágenes de galería**: prevista para Módulo 17 (hoy se agregan por URL).

## Actualización — NOTIFY_EMAIL único → NOTIFY_EMAIL_CONTACT / NOTIFY_EMAIL_JOBS

- **Qué cambió**: antes `NOTIFY_EMAIL` (única) avisaba tanto cotizaciones como postulaciones al mismo correo. Ahora hay dos variables: `NOTIFY_EMAIL_CONTACT` (solo `ContactMessage` → cotizaciones/contacto) y `NOTIFY_EMAIL_JOBS` (solo `JobApplication` → hojas de vida), porque cada caso va a un correo distinto.
- **Dónde se decide el destinatario**: `src/services/notification.service.ts` (`sendNotification` recibe el `to` por evento). El registro del mensaje/postulación se guarda SIEMPRE en la BD; el correo es una notificación adicional que nunca bloquea la respuesta (try/catch + `console.warn`).
- **Env**: `src/config/env.ts` declara ambas con default de desarrollo (`notify-contact@highclean.local`, `notify-jobs@highclean.local`) y el guard de producción exige que **ninguna** use el valor de dev (el backend no arranca). `.env.example` las documenta; `NOTIFY_EMAIL` quedó **en desuso** (una clave vieja en `.env` es ignorada por Zod, no rompe el arranque, pero deja de usarse).
- **Estado real de High Clean SAS**: `NOTIFY_EMAIL_CONTACT` → `highcleanclaient@gmail.com`. `NOTIFY_EMAIL_JOBS` → `talentohighcleansas@gmail.com` (inbox de hojas de vida, reenvía desde `trabajos@highcleansas.com` vía Cloudflare Email Routing). En producción ambas son obligatorias.
- **Remitente (M17 prep.)**: el backend envía las notificaciones desde `EMAIL_FROM` (configurable, `src/config/env.ts` con default de desarrollo `onboarding@resend.dev` y guard de producción que impide usar ese remitente). Para High Clean: `EMAIL_FROM=notificaciones@highcleansas.com` (dominio verificado en Resend).
- **Correo público de contacto**: el campo `Company.email` mostrado en `/contacto`, chatbot, política de datos y JSON-LD es `cotizaciones@highcleansas.com` (reenvía a la casilla real vía Cloudflare Email Routing). El remitente (`EMAIL_FROM`) y los destinatarios internos (`NOTIFY_EMAIL_*`) son cosas distintas del dato público.
- **WhatsApp**: el seed (`prisma/seed.ts`) carga `whatsappNumber: '+573209498347'`; con ese dato el botón flotante del frontend aparece (condición en `WhatsAppButton.tsx`).
---

## Actualizaci�n � Identificaci�n legal (raz�n social y NIT)

Se complet� la identificaci�n legal de la empresa y se reemplazaron los TODOs de la p�gina de pol�tica de datos que este m�dulo dej� "verbatim":

- **Modelo Company**: campo nuevo 
it String? (+ migraci�n `20260918020517_add_company_nit`). **No** se agreg� legalName: la raz�n social ya es 
ame ("High Clean SAS"); un campo espejo podr�a desincronizarse.
- **Seed**: 
it: '901330960-1'.
- **Panel admin**: 
it editable (misma secci�n "Datos de contacto") con validaci�n Zod de formato NNNNNNNNN-D (`/^\d{6,15}-\d$/`).
- **Footer**: la l�nea de copyright muestra raz�n social + NIT (� {a�o} High Clean SAS � NIT 901330960-1).
- **PoliticaDeDatos.tsx**: ahora usa useCompany() (antes era 100% est�tica). La secci�n 1 (Responsable del tratamiento) muestra raz�n social + NIT y correo/tel�fono reales de Company; la direcci�n sigue como TODO porque no hay sede f�sica �nica. La secci�n 6 (derechos del titular) tambi�n usa el correo real de Company. Mientras cargan los datos o si faltan, cae al TODO_TEXT.
- Tests: backend company.test.ts (expone 
it) y dmin.test.ts (PATCH de NIT v�lido + rechazo de NIT sin guion).
