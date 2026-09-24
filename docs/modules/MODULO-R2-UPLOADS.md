# MÓDULO R2 — SUBIDA DE MEDIOS A CLOUDFLARE R2

> Estado: implementado y **ejecutado con datos reales** (16 archivos subidos y URLs públicas
> verificadas con GET real). Pendiente: push (se pide autorización al cierre).

## Qué se hizo

Implementación completa de la subida de fotos de servicios y de la galería a Cloudflare R2,
incluyendo endpoint de administración y carga inicial de los medios reales del cliente.

1. **Migración**: enum `GalleryType` (`IMAGE | VIDEO`), `GalleryImage.type` con default
   `IMAGE` y `Service.imageUrl String?`. (`20260924032601_add_gallery_type_and_service_image`)
2. **Infraestructura de storage**:
   - `src/utils/media.ts`: helpers de nombres (`slugify` con transliteración de diacríticos,
     `safeObjectKey` contra *path traversal*, `extnameOf`, `isImageExtension`,
     `isVideoExtension`, `mediaTypeOf`).
   - `src/lib/r2.ts`: cliente S3 perezoso vía AWS SDK v3 (`@aws-sdk/client-s3`), endpoint
     R2, `region: 'auto'`, `forcePathStyle: true`, guard verifica las 6 variables antes de
     construir el cliente. `StorageError` (502) añadido a `httpError.ts`.
   - `src/services/storage.service.ts`: `uploadObject(key, body, contentType)` →
     `{ key, url }` con `R2_PUBLIC_BASE_URL`; `deleteObjectIfManaged(url)` borra de R2 solo
     urls del bucket gestionado (no toca URLs externas).
   - `src/middleware/uploadMedia.ts`: dos middlewares multer en memoria: `uploadServicePhoto`
     (imágenes ≤10 MB) y `uploadGalleryMedia` (imagen/video ≤25 MB), con validación de
     extensión + mimetype, mensajes dedicados de tamaño/campo.
   - `env.ts`: 6 variables R2 opcionales en dev/test, **obligatorias en producción**
     (guard fail-closed; sin ellas el backend no arranca). Documentadas por nombre en
     `.env.example` / `.env.production.example`.
3. **Endpoints admin** (`/api/v1/admin`, requieren sesión admin):
   - `POST /services/:id/photo` → sube a `services/<slug>.<ext>` y fija `Service.imageUrl`.
   - `POST /gallery/upload` → sube a `gallery/<archivo-saneado>` y crea `GalleryImage` con
     `type` derivado de la extensión; `alt` opcional. Al borrar galería/servicio se elimina
     también el objeto de R2 cuando la URL es gestionada.
4. **Frontend**:
   - Admin Galería: formulario "Subir archivo" (file input con `accept` restringido, alt,
     spinner), además del formulario por URL existente; los videos se previsualizan con
     `<video controls>` y etiqueta "Video".
   - Galería pública: renderiza `<video controls>` cuando `type === 'VIDEO'`.
   - `api.ts`: `Service.imageUrl`, `GalleryImage.type`; `admin.ts`: `uploadGalleryFile` con
     `FormData` (el helper `request` ya no fuerza `Content-Type: application/json` para
     FormData).
5. **Script one-off** `scripts/one-off/upload-assets.ts` + README: crea los 7 Services si
   faltan (solo `name` + `imageUrl`), sube sus fotos desde `Descargas`, sube
   `galeriahighclean/` y verifica cada URL pública con GET real (lista no-2xx, exit≠0).

## Por qué

- El cliente necesita mostrar fotos/servicios reales; sin un storage público no hay URLs
  estables. Se eligió Cloudflare R2 por el Custom Domain ya conectado
  (`https://media.highcleansas.com`, "Active" en Cloudflare) y coste variable — decisión
  confirmada con Jonathan.
- El script crea los servicios **solo con nombre e imageUrl**; la información completa la
  aportará el módulo de servicios reales (upsert por nombre, pendiente y separado).

## Arquitectura resultante

```
Frontend (admin Galería / Servicios)
   │  POST /api/v1/admin/gallery/upload  (FormData, multipart)
   ▼
Express → requireAuth/requireAdmin → multer mem (10/25 MB, filtro ext+mime)
   → admin.service → storage.service.uploadObject
        │  PutObject (AWS SDK v3, endpoint R2, forcePathStyle)
        ▼
Cloudflare R2 bucket (highcleansas-media)
   ▼  público vía Custom Domain
https://media.highcleansas.com/{services|gallery}/<slug|archivo>
   ▼
GET /api/v1/services → Service.imageUrl · GET /api/v1/gallery → type IMAGE|VIDEO
   → Galería pública <video controls> / <img>
```

## Archivos creados/modificados

- `prisma/schema.prisma`, `prisma/migrations/20260924032601_*`
- `src/config/env.ts`, `src/env.test.ts`, `.env.example`, `.env.production.example`
- `src/utils/media.ts`, `src/utils/httpError.ts`, `src/lib/r2.ts`,
  `src/services/storage.service.ts`, `src/middleware/uploadMedia.ts`
- `src/repositories/{gallery,service}.repository.ts`, `src/schemas/admin.schema.ts`,
  `src/services/admin.service.ts`, `src/controllers/admin.controller.ts`,
  `src/routes/admin.routes.ts`, `src/r2.test.ts`
- `scripts/one-off/upload-assets.ts`, `scripts/one-off/README.md`
- `app/frontend/src/lib/{api,admin}.ts`, `app/frontend/src/pages/admin/Galeria.tsx`,
  `app/frontend/src/pages/Galeria.tsx`, `app/frontend/src/lib/seo.test.ts`
- Dependencia: `@aws-sdk/client-s3` (backend)

## API

| Método | Ruta | Cuerpo | Resultado |
| --- | --- | --- | --- |
| POST | `/api/v1/admin/services/:id/photo` | multipart `file` (imagen ≤10 MB) | 200 `Service` con `imageUrl` |
| POST | `/api/v1/admin/gallery/upload` | multipart `file` (≤25 MB) + `alt?` | 201 `GalleryImage` con `type` |
| GET | `/api/v1/gallery` | — | lista con `type` |
| GET | `/api/v1/services` | — | servicios con `imageUrl` |

## BD

- `GalleryType` enum, `GalleryImage.type` (`IMAGE` default), `Service.imageUrl String?`.
- `GalleryImage.type` y `Service.imageUrl` agregados, sin campos inventados.

## Seguridad

- Multer en memoria con límites estrictos; validación de extensión y mimetype por
  middleware; tamaño máx. (10 MB imagen / 25 MB video) con mensaje en español.
- Nombres de objetos saneados (`safeObjectKey`, `slugify`): sin diacríticos ni `../`.
- Borrado de objetos gestionados solo si la URL pertenece a `R2_PUBLIC_BASE_URL`.
- Vars R2 opcionales en dev/test, obligatorias en prod (fail-closed en arranque);
  secretos solo en `.env` (no versionado), `.env.example` documenta solo nombres.
- Errores de storage centralizados vía `StorageError` (502).

## Testing y calidad

- `src/r2.test.ts` (8 tests) con `storage.service` mockeado (sin red): 401 sin sesión,
  subida de foto fija `imageUrl`, rechazo de `.txt`/`.pdf`, `type=IMAGE`/`VIDEO`, borrado
  con limpieza R2. El `beforeEach` hace limpieza global (como `reviews.test`/`company.test`)
  para no interferir con el resto de archivos (`fileParallelism: false`).
- Backend: **92/92** ✅ · lint/typecheck/build ✅ · coverage por encima de umbrales
  (82.57/62.84/88.66/83.6). Frontend: **54/54** ✅ · lint/typecheck/build ✅.
- Ejecución del script contra R2 real: 7 fotos de servicios + 9 archivos de galería
  (8 IMAGE + 1 VIDEO) subidos, **todos los URLs verificados 2xx con GET real** (confirmación
  en vivo posterior: 16/16 HTTP 200; la URL `services/hogar.jpeg` da 404 intencionalmente
  porque no existe esa key — las keys usan el slug del servicio, ej. `services/aseo-del-hogar.jpeg`).

## Seguridad: `npm audit` (decisión documentada)

- `npm audit` reporta **4 hallazgos `high`**, todos a través de la dependencia **dev**
  `prisma` (CLI): `@prisma/config` (vía `deepmerge-ts`, stack exhaustion al mergear grafos
  recursivos) y `mysql2` (downgrade de plugin de auth → fuga de credenciales en diseño;
  descompresión zlib → DoS). Metadata del audit: **prod 282 dependencias → 0 findings**;
  total 4; todos por el CLI.
- El proyecto usa **PostgreSQL**: el código de `mysql2` no se ejecuta en ningún camino.
- **Estas vulnerabilidades NO llegan al bundle/artefacto que corre en producción**:
  1. `prisma` es `devDependency` (solo `db:generate`/`db:migrate`/`db:seed` en build/CI).
  2. El artefacto de backend es `dist/` (`tsc`); el servidor no importa el CLI de Prisma.
  3. El `Dockerfile` de M17 instala con `npm ci --omit=dev` → no se instalan en la imagen.
  4. El bundle de Vite (frontend) no incluye nada de Prisma → frontend en **0 hallazgos**.
- Acción: **NO** se ejecuta `npm audit fix --force` (forzaría major del CLI y lo rompería).
  Plan: subir el CLI de Prisma cuando la versión estable siguiente incluya el advisory
  corregido. Re-evaluar en cada módulo.

## Git

18 commits atómicos `5522565..dce9ee8` (ver cierre del módulo).

## Cómo modificarlo

- Agregar otro tipo de medio: ampliar `media.ts` y restricciones del middleware.
- Cambiar el dominio público: tocar `R2_PUBLIC_BASE_URL` (env), clave a resolver en
  Cloudflare R2 → Custom Domains.
- El módulo de servicios reales completará `description` (y demás) de los 7 Services
  creados por `upload-assets.ts`, haciendo upsert por `name` (fit: ya existen con `imageUrl`).

## Problemas y soluciones

- **Cliente Prisma desactualizado** tras el cambio de schema: los tipos de `Service`
  no tenían `imageUrl` → regenerar con `npm run db:generate`.
- **company.test.ts FK `Review_companyId`**: datos del seed (empresa+reseñas reales) aún
  presentes al correr la suite; es un choque de orden/limpieza preexistente, no causado por
  este módulo (el beforeEach de `r2.test.ts` replica la limpieza global de `reviews.test`).
- **Falso negativo de variables R2**: un grep con anclaje `^` sugirió que faltaban cuando
  sí existían en `.env`; verificado key a key.
- **URL incorrecta en test de limpieza**: la subida se asociaba a la *primera* empresa
  (`requireExistingCompany` = `findCompany`); con limpieza global en `beforeEach` el test
  queda determinístico.

## Actualización

Módulo realizado tras el extra de "cambio de contraseña". La API `GET /api/v1/services`
ahora devuelve los 7 servicios reales con `imageUrl` y la galería tiene 9 ítems
(8 IMAGE + 1 VIDEO) servidos desde `https://media.highcleansas.com`.