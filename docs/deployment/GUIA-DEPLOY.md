# GUÍA DE DEPLOY — Escenario A (mismo origen, 100 % tier gratis)

> Actualizado: 2026-09-23 · Arquitectura confirmada con Jonathan.
> **Esta fase no despliega nada**: la guía es el manual ejecutable para cuando haya
> fotos y servicios reales. Costo objetivo: **$0/mes**. Ver comparativa con fuentes en
> `provider-comparison.md`.

## Arquitectura

```
                 ┌─────────────────────────────────────────────────┐
  visitante ────► │   cloudflare (zona highcleansas.com)           │
                 │                                                 │
                 │   Pages  ──►  SPA estática (dist/ del frontend) │
                 │      │                                          │
                 │      │  /api/*                                  │
                 │      ▼                                          │
                 │   Worker  ──►  Render (Node/Express) ──► Neon   │
                 │   (proxy de /api/*)   │        (Postgres)       │
                 │                      └── Resend (correos)       │
                 └─────────────────────────────────────────────────┘
```

El navegador solo ve **un origen** (`https://highcleansas.com`): la cookie `sid`
funciona con `sameSite:'lax'`, CSRF `requireSameOrigin` sigue protegiendo y no se
necesita CORS con credenciales (Escenario A de ADR-004).

### Requisitos previos (los tienes)

- Dominio `highcleansas.com` registrado en Cloudflare (DNS en la zona de Cloudflare).
- Repositorio Git de High Clean SAS (GitHub).
- Cuentas a crear en el momento del deploy (CERO ahora): Cloudflare ya existe,
  **Render**, **Neon**. Sin tarjeta en ninguna.
- Correos ya resueltos: dominio verificado en **Resend**; sender `EMAIL_FROM`
  (`notificaciones@highcleansas.com`), destinatarios `NOTIFY_EMAIL_CONTACT`
  (`cotizaciones@…` reenvía a la real) y `NOTIFY_EMAIL_JOBS`
  (`talentohighcleansas@gmail.com`). Cloudflare Email Routing ya creado.

---

## Paso 1 — Base de datos en Neon (5 minutos)

1. Crear cuenta en neon.com (sin tarjeta) y **proyecto** nuevo.
2. En "Connection Details" → copiar la cadena **pooled** (usa PgBouncer):
   `postgresql://highclean:<password>@ep-<...>-pooler.region.aws.neon.tech/neondb?sslmode=require`
   → será `DATABASE_URL` en Render.
3. Guarda la credencial en tu gestor de contraseñas. Nunca en Git.

### Migraciones y seed (local, apuntando a Neon)

Desde tu máquina (solo configuración, con `DATABASE_URL` apuntando a Neon):

```bash
# migrar (crea el esquema)
$env:DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
cd app/backend
npm run db:deploy        # prisma migrate deploy
npm run db:seed          # siembra empresa + reseñas + admin (ADMIN_EMAIL/ADMIN_PASSWORD)
npm run db:generate
```

> Render free **no permite one-off jobs** para sembrar: por eso el seed se ejecuta
> desde local una única vez antes del primer despliegue. El release de Render correrá
> `prisma migrate deploy` (idempotente) en cada despliegue.

## Paso 2 — Backend en Render

### Opción de artefacto incluida en el repo

`render.yaml` (raíz del repo) + `deploy/backend/Dockerfile`. Al conectar el repo en
Render, la plataforma detecta el Blueprint y crea el servicio.

### ⚠️ Requiere rellenar **secrets** en el dashboard (nunca en Git)

En `render.yaml`, los valores sensibles están `sync: false` → aparecen como variables
manuales en Render (env vars del servicio). Lista mínima (ver `.env.production.example`):

| Variable | Valor que pondrás (ej.) | Secreto |
| --- | --- | --- |
| `NODE_ENV` | `production` | no |
| `DATABASE_URL` | cadena pooled de Neon | **sí** |
| `SESSION_SECRET` | ≥32 caracteres aleatorios | **sí** |
| `ADMIN_EMAIL` | correo del acceso admin | sí (no el de dev) |
| `ADMIN_PASSWORD` | contraseña fuerte del admin | **sí** |
| `CORS_ORIGIN` | `https://highcleansas.com` (NUNCA `*`) | no |
| `RESEND_API_KEY` | key de Resend | **sí** |
| `EMAIL_FROM` | `notificaciones@highcleansas.com` | no |
| `NOTIFY_EMAIL_CONTACT` | correo que recibe cotizaciones | no |
| `NOTIFY_EMAIL_JOBS` | correo que recibe hojas de vida | no |
| `PORT` | Render lo inyecta automáticamente (default 3000) | no |

> El guard de producción de `env.ts` impide arrancar si `CORS_ORIGIN=*`, si
> `SESSION_SECRET`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` usan valores de desarrollo, o si falta
> `RESEND_API_KEY`. Es **intencional** (fail-closed).

### Migraciones en release (Render Free — manual)

Render Free **no soporta `preDeployCommand`** (limitación del plan gratis).
Por tanto, las migraciones **NO se ejecutan automáticamente** en cada deploy.

Cuando agregues un módulo nuevo con cambios de esquema (nueva migración Prisma):

1. **Desde local**, con `DATABASE_URL` apuntando a la BD de producción (Neon pooled):
   ```bash
   cd app/backend
   npm run db:deploy        # prisma migrate deploy
   ```
2. Verifica que la migración se aplicó correctamente (consultando la BD o logs).
3. Haz `git add` + commit del código que depende de la migración + push.
4. Render hará deploy del código; la BD ya tiene el esquema actualizado.

> ⚠️ Si el código nuevo requiere la migración y **no** la aplicaste antes,
> el deploy fallará en runtime (errores de esquema). Haz la migración **antes** del push.

### Health check y cold start

- `healthCheckPath: /api/v1/health` (endpoint existente, sin autenticación).
- Tier free: el servicio **duerme a los 15 min sin tráfico** y el **primer visitante
  espera ~30–60 s** mientras despierta. Aceptable en esta fase; se elimina con el plan
  de pago ($7/mes) cuando haya tráfico constante.
- Mientras duerme, Render responde `robots.txt` con `Disallow: /` para no penalizar SEO;
  al despertar se sirve el real.

## Paso 3 — Frontend en Cloudflare Pages

1. Dashboard CF → **Workers & Pages → Create → Pages → Connect to Git** (repo + rama `main`).
2. Build settings:
   - **Build command**: `npm ci && npm run build` (el `prebuild` genera sitemap/robots).
   - **Output** directory: `dist`.
   - **Environment variables (build)**: `VITE_SITE_URL=https://highcleansas.com`
     (obligatoria: el build aborta en producción si falta o apunta a localhost).
   - Framework preset: default (SPA + React Router; el fallback de rutas lo da
     `public/_redirects`, ya incluido en el repo).
3. **Production domain**: añadir `highcleansas.com` (CF emite el TLS automáticamente;
   si la zona ya está en Cloudflare, es solo un CNAME/A record administrado por Pages).
4. Tras cada push a `main`, Pages redeploya. (CI de GitHub sigue siendo la puerta de
   calidad; deploy automático de Pages es lo deseado para el sitio público.)

## Paso 4 — Worker proxy de `/api/*`→ Render

Artefacto en `deploy/cloudflare-worker/` (`worker.ts` + `wrangler.toml`, placeholders).

1. En el dashboard **Workers & Pages → Create Worker** → subir `worker.ts` (o usar
   `wrangler deploy` desde `deploy/cloudflare-worker/`).
2. Definir **variable de entorno `BACKEND_ORIGIN`** = `https://<tu-servicio>.onrender.com`
   (URL pública del backend de Render; no es secreto, pero se configura en el panel).
3. Ruta: patrón `highcleansas.com/api/*` (zona CF). Solo intercepta `/api/*`; todo lo
   demás lo sirve Pages.
4. **Precedencia de rutas (importante):** cuando Pages y un Worker comparten zona,
   verifica en el dashboard que `/api/*` resuelva al Worker. Si Pages capturara la petición
   (el fallback SPA la enviaría a `/index.html`), el campo `_redirects` de Pages NO debe
   tragar `/api/*`. Respaldo si algo no cuadra: convertir el proxy en una **Pages Function**
   `functions/api/[[route]].ts` (mismo código, sin ruta de Worker; igual cuenta en el
   cuota gratis de Workers). En esa misma carpeta el worker está escrito para ser agnóstico
   de esa diferencia: la única variación es cómo se expone.
5. El Worker **conserva `Set-Cookie`** del backend tal cual: como es mismo origen, el
   navegador acepta la cookie `sid` con `sameSite:'lax'` y `secure` activo en HTTPS.

Probar tras desplegar:
```bash
curl -s https://highcleansas.com/api/v1/health          # debe responder ok + database up
curl -s https://highcleansas.com/                       # SPA
curl -s https://highcleansas.com/api/v1/company         # JSON de la empresa
```

## Paso 5 — DNS / TLS / SEO

- DNS ya es de Cloudflare (registrador + zona) → sin tocar nameservers.
- Pages y el Worker emiten certificados automáticos para `highcleansas.com` (+ `www`
  si decides redirigir `www → apex` con una regla de redirect en Pages/Workers).
- `VITE_SITE_URL=https://highcleansas.com` hace que canonical/OG/sitemap/robots/JSON-LD
  apunten al dominio definitivo desde el primer build.
- **Search Console (Módulo 18)**: verificación completada ✅
  1. **GSC → Add property** → Domain `highcleansas.com` → verificación DNS (auto en Cloudflare)
  2. **Sitemaps** → Submit `https://highcleansas.com/sitemap.xml` → **Success**
  3. **URL Inspection** → Request indexing para: `/`, `/servicios`, `/contacto`, `/trabaja-con-nosotros`, `/nosotros`, `/galeria`, `/resenas`, `/politica-de-datos`
  4. **Monitoreo**: Coverage, Core Web Vitals, Performance, Security

- `VITE_SITE_URL=https://highcleansas.com` hace que canonical/OG/sitemap/robots/JSON-LD
  apunten al dominio definitivo desde el primer build.

## Checklist cuando agregues un módulo nuevo con cambios de BD

1. **Desde local** (con `DATABASE_URL` → Neon producción):
   ```bash
   cd app/backend
   npm run db:generate   # regenera cliente Prisma
   npm run db:deploy     # aplica migración a Neon
   ```
2. Verifica que la migración se aplicó (consulta la BD o logs).
3. Commit + push del código que depende de la migración.
4. Render deploya el código (la BD ya tiene el esquema).

> Esto sustituye al `preDeployCommand` automático que no existe en plan Free.

## Checklist de verificación post-deploy (manual)

1. `GET /api/v1/health` → `{"status":"ok","database":"up"}`.
2. `GET /api/v1/company` → datos reales (nombre, NIT, email `cotizaciones@…`, WhatsApp,
   ciudades, horarios).
3. `/contacto` envía un mensaje de prueba → llega a `NOTIFY_EMAIL_CONTACT` **desde**
   `EMAIL_FROM` (verificado en Resend).
4. `/trabaja-con-nosotros` envía una postulación + PDF → llega a `NOTIFY_EMAIL_JOBS`.
5. Cambiar a `https://highcleansas.com` → recarga **con el candado** y **con la cookie
   `Secure`** (DevTools → Application → Cookies → `sid`).
6. `/admin` → login OK (la cookie sigue funcionando same-origin) y CSRF intacto
   (`CORS_ORIGIN` exacto; pedir una mutación con `Origin` distinto → 403).
7. Chatbot responde con contacto/horarios reales (sin fallback).
8. Refrescar el servicio por una pausa de 15 min → primera petición lenta (~30–60 s),
   luego responsivo.
9. **GSC**: Sitemap enviado ✅, URLs indexadas solicitadas ✅, Coverage sin errores ✅.

## Rollback / recuperación

- **Render**: cada deploy es un release con rollback (free solo conserva los 2 últimos).
- **Pages**: versiones (`versions`) y rollback desde el dashboard.
- **Worker**: `wrangler rollback` o versión anterior.
- **Neon**: historial de 6 h con instant restore para rescatar datos si algo se rompe.

## Limitaciones asumidas (todas documentadas en provider-comparison.md)

- Render free: 750 h/mes (~24/7), cold start 30–60 s, 5 GB outbound/mes, FS efímero.
- Worker free: 100.000 req/día, 10 ms CPU/invocación (proxy puro: sin problema).
- Neon free: 100 CU-h/mes (scale-to-zero), 0.5 GB, 5 GB egress/mes.
- Cuota de builds de Pages: 500/mes.

## Salir del free (cuando haya tráfico estable)

1. Backend a `0.5c-512mb` ($7/mes) o Railway Hobby ($5) → sin sleep ni cold start.
2. Neon a Launch (pay-as-you-go) o Render Postgres (desde $6/mes) si crece la BD.
3. Galería con fotos reales → objetos en **R2** (10 GB gratis en CF) en vez del `data:`.