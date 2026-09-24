# Módulo 6 (extensión) — Servicios reales y estadísticas

## Qué se hizo
Se completó el módulo de servicios con **contenido real y operativo**, cerrando la pendiente del Módulo 6/R2:

1. **Los 7 servicios pasan de tener nombre + foto a mostrar descripción y modalidades/precios reales**.
   - Nuevo modelo `ServiceOption` (`label`, `price` int COP, `note?`, `group?`, `sortOrder`).
   - El seed carga descripciones fieles de `servicioshighclean.md` (apertura + bullets "Funciones principales:") y las modalidades exactas que High Clean cobra por servicio (Tiempo Completo, Medio Tiempo, Por Días, con notas de contexto).
   - La página pública `/servicios` renderiza: foto (R2), descripción, y un **acordeón clickeable "Ver modalidades y precios"** que agrupa opciones por grupo (p. ej. Grandes superficies "Generales"/"Todero") y muestra cada modalidad con su precio formateado en COP y nota.
2. **Franja de estadísticas en Home** con 3 números reales de la empresa: `activeClients` (500), `yearsOperating` (8), `monthlyServices` (700), editables desde el panel admin.
3. **Panel admin**: editor de modalidades por servicio (alta/baja, reordenar, precio con vista previa formateada, grupo, nota) y campos numéricos de estadísticas.

## Decisiones del usuario (aprobadas)
- **D1 (etiquetas)**: las estadísticas del Home se muestran exactamente como **"Clientes activos" · "Años de experiencia" · "Servicios al mes"** (descartadas alternativas "Años de operación", etc.).
- **D2 (precios/descripciones)**: solo contenido real entregado: los precios y notas son los que High Clean cobra hoy; ninguna cantidad inventada.
- **D3 (upsert por nombre, sin constraint)**: se intentó `@unique` en `Service.name` para usar `upsert` de Prisma, pero `prisma migrate dev` falló en entorno no interactivo ("Prisma Migrate has detected that the environment is non-interactive, which is not supported") → se revirtió. El seed hace upsert **manual**: `findFirst(name in [canonical, ...legacyNames])`, actualiza `name`+`description` siempre, y crea `ServiceOption`s **solo si el servicio no tiene ninguna** (respeta ediciones del panel admin). Nunca toca `imageUrl` ni los keys/slugs de R2.
- **D4 (renombres canónicos con legacyNames)**: el seed mapea los nombres "legacy" (con los que R2 creó los servicios) a los canónicos: `Cuidado de Adulto Mayor→Cuidado Adulto Mayor`, `Conjuntos Residenciales→Aseo Conjuntos Residenciales`, `Niñeras→Niñera`, `Oficinas→Aseo de Oficinas`, `Alquiler Vacacional (Airbnb)→Limpieza Airbnb`. `Aseo del Hogar` y `Planchado` no cambian.
- **D5 (auto-reparación del seed tras corridas de tests)**: una corrida de la suite backend borra los `Service`/`GalleryImage` reales (y con ellos `imageUrl`). El seed ahora **restaura también referencias de medios**: asigna el `imageUrl` estándar a los 7 servicios (si falta) y recrea los 9 archivos de galería si la tabla quedó vacía, usando URLs deterministas de `https://media.highcleansas.com` (verificadas 2xx en R2).

## Arquitectura
```
prisma/schema.prisma
  ServiceOption { id, serviceId FK, label, price Int, note?, group?, sortOrder }
  Service <--1:N--> ServiceOption
  Company.activeClients | yearsOperating | monthlyServices (Int?)

GET /api/v1/services           → incluye options (orderBy sortOrder asc, createdAt asc)
PUT /api/v1/admin/services/:id/options  → reemplazo transaccional (deleteMany + createMany)
PATCH /api/v1/admin/company    → acepta los 3 campos numéricos de estadísticas

seed.ts
  SERVICES_SEED: 7 servicios { canonicalName, legacyNames[], description, options[] }
  seedServices(companyId): upsert manual + opciones solo si count==0
  GALLERY_SEED / SERVICE_MEDIA_SLUGS: auto-reparación de referencias de medios

frontend
  lib/formatPrices.ts → formatCOP(): Intl.NumberFormat('es-CO', COP, maxFractionDigits:0)
  /servicios → tarjetas con foto, descripción y acordeón de modalidades
  / (Home)   → franja con  clientes activos / años de experiencia / servicios al mes
  /admin/servicios → OptionsEditor por servicio (modalidades)
  /admin/empresa   → tarjeta "Estadísticas" (3 inputs numéricos)
```
- El reemplazo de opciones es **transaccional** (`$transaction`): falla → nada cambia.
- Moneda: los precios se guardan como entero COP y se formatean con `Intl` (¡ojos: el separador de miles es espacio no rompible, relevante en tests!).

## Archivos creados / modificados
- Backend — `prisma/schema.prisma`, `prisma/migrations/20260924044331_add_service_options_and_company_stats/`, `prisma/seed.ts`, `src/repositories/service.repository.ts` (include options + `replaceServiceOptions`), `src/schemas/admin.schema.ts` (stats + `serviceOptionSchema` 1–50 opciones, price 0–100000000), `src/services/admin.service.ts`, `src/controllers/admin.controller.ts`, `src/routes/admin.routes.ts` (`PUT /services/:id/options`).
- Backend — tests: `src/admin.test.ts` (stats + options), `src/r2.test.ts` (limpieza tolerante a FK entre suites paralelas).
- Backend — script one-off `scripts/one-off/restore-media-references.ts`: lista el bucket R2, verifica cada URL con GET real y regenera `imageUrl`/galería (usado una vez al detectar la pérdida por tests).
- Frontend — `src/lib/api.ts` (ServiceOption + `Service.options` + stats), `src/lib/admin.ts` (`replaceServiceOptions`, inputs), `src/lib/formatPrices.ts` (+ test), `src/pages/Servicios.tsx` (+ test), `src/pages/Home.tsx`, `src/pages/admin/Servicios.tsx`, `src/pages/admin/Empresa.tsx`, fixtures (`lib/seo.test.ts`, `components/WhatsAppButton.test.tsx`).

## API
- `GET /api/v1/services` y `GET /api/v1/admin/services` → ya devuelven `options: [{id, label, price, note, group, sortOrder}]` ordenadas.
- `PUT /api/v1/admin/services/:id/options` (requireAuth/requireAdmin): body `{ options: [...] }`, valida 1–50 opciones; `label ≤100`, `price` entero 0–100000000, `note ≤300`, `group ≤80`, `sortOrder 0–1000`, cadena vacía → `null`. 404 si el servicio no existe. Devuelve el servicio actualizado.
- `PATCH /api/v1/admin/company` → acepta `activeClients`, `yearsOperating`, `monthlyServices` (int ≥0; años máx 120).

## BD
- Migración `20260924044331_add_service_options_and_company_stats`: tabla `ServiceOption` (FK cascade) + 3 columnas `Int?` en `Company`.
- Seed: 7 servicios (canónicos) + 23 modalidades con precios reales; stats 500/8/700; idempotente.

## Seguridad
- Validación estricta Zod en el reemplazo de opciones (rángulos y longitudes); precios enteros (sin decimales/inyección de formato).
- No se exponen datos sensibles; las opciones son públicas (precios que la empresa ya publica).

## Testing y calidad
- Backend: **96/96 tests** ✅, coverage sobre umbral (Stmts 82.92 / Branch 63.04 / Funcs 89.09 / Lines 83.92), lint/typecheck/build ✅.
- Frontend: **59/59 tests** ✅ (nuevos: `formatPrices`, `Servicios` público), coverage sobre umbral (41.51/29.65/32/42.95), lint/typecheck/build ✅.
- Seed + API real verificados: 7 servicios con foto (URL R2 2xx) + opciones; stats 500/8/700.
- Recordatorio transversal: corridas de tests borran la empresa/servicios/galería → restaurar siempre con `npm run db:seed`.

## Git (17 commits, por capa — §17.1)
1. `feat: add ServiceOption model and company stats to schema`
2. `feat: seed real service options, company stats and media references`
3. `feat: include and replace service options in repository`
4. `feat: validate service options and company stats in admin schema`
5. `feat: add replace service options admin service`
6. `feat: handle replace service options controller`
7. `feat: register admin PUT service options route`
8. `fix: isolate r2 tests from parallel service cleanup`
9. `test: add service options and company stats tests`
10. `feat: type service options and company stats in API client`
11. `feat: add replace service options admin API client`
12. `feat: format Colombian peso prices`
13. `feat: render service descriptions and clickable price modalities`
14. `feat: show company stats band on home`
15. `feat: add service options editor to admin`
16. `feat: add company stats inputs to admin`
17. `test: add formatPrices and public Servicios tests`
- **Push pendiente de autorización del usuario** (regla 5).

## Problemas y soluciones
- **`@unique` en `Service.name`**: migración falló en entorno no interactivo → revertido; upsert manual (D3).
- **Corrida de tests borró `imageUrl` + galería reales**: se detectó al verificar `/servicios` (fotos en null). Solución doble: script one-off de restauración con verificación de URL 2xx (ejecutado) + seed auto-reparable (D5) para que no se repita.
- **Formato COP vs tests RTL**: `Intl` produce espacio no rompible (`$ 3.350.000` con `\u00A0`); RTL normaliza el nbsp del DOM pero no el del string esperado → en las aserciones usar cadenas con espacio plano.
- **`getByText` y elementos `hidden`**: los acordeones cerrados (atributo `hidden`) igual los encuentra `getByText`; no usar `queryByText(...) => null` para estados ocultos.

## Cómo modificarlo
- **Agregar/quitar modalidad de un servicio**: editor en `/admin/servicios` (PUT a `/api/v1/admin/services/:id/options`) o directamente en `SERVICES_SEED` + `npm run db:seed` (solo creará opciones si el servicio no tiene ninguna — para forzar, borrar las opciones en admin o en BD).
- **Cambiar textos/etiquetas de la franja Home**: `src/pages/Home.tsx` (array `stats`); los números vienen de PATCH admin → `Company`.
- **Renombrar un servicio sin perder foto**: editar `canonicalName`/`legacyNames` en `SERVICES_SEED`; el `imageUrl` de R2 se conserva por slug legacy en `SERVICE_MEDIA_SLUGS`.