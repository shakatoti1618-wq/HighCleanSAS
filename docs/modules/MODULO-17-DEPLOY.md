# MÓDULO 17 — DEPLOY

> Estado: investigación + documentación + artefactos de configuración. **Sin despliegue real**
> (decidido con Jonathan: el sitio aún no tiene fotos ni servicios reales del cliente). CERO
> cuentas/credenciales del usuario se tocaron en este módulo.

## Qué se hizo

1. **Investigación de tiers gratuitos actuales (septiembre 2026)** con fuentes con fecha,
   comparando frontend (Cloudflare Pages, Vercel, Netlify, Render Static), backend
   (Render Free, Railway Free, Koyeb Hobby, Fly.io) y base de datos (Neon Free, Supabase
   Free, Render Postgres Free, Koyeb Postgres, Railway Postgres).
2. **Decisión confirmada con Jonathan** (checkpoint de ambigüedad técnica, regla del prompt
   maestro): arquitectura **Escenario A — mismo origen**: SPA en **Cloudflare Pages** +
   **Worker de Cloudflare** que proxea `/api/*` a **Node/Express en Render Free** con
   **Postgres en Neon Free**. Costo objetivo: $0/mes.
3. Corrección verificada contra documentación oficial: **Render Free incluye 5 GB de
   outbound al mes** (plan Hobby), no 100 GB (cifra que circula de artículos del tier
   2022–2023). Jonathan confirmó quedarse con la cifra oficial (5 GB). El mismo 5 GB lo
   tiene Neon de egress (coincidencia).
4. Artefactos de configuración listos para el día que se despliegue:
   Worker proxy + `wrangler.toml`, `Dockerfile` (Node 26) + `render.yaml` (Blueprint),
   `.env.production.example`, `_redirects` de Pages para SPA.

## Por qué

- El Módulo 17 del plan maestro requiere investigar opciones gratuitas **actuales** (sin
  inventar precios/límites) y dejar la web lista para publicar. La arquitectura de "mismo
  origen" se eligió porque permite mantener la cookie de sesión (`sameSite:'lax'`,
  `secure:'auto'`), el CSRF `requireSameOrigin` y el CORS sin cambios de código en
  producción (ver resolución en ADR-004).
- Estándares únicamente: `DATABASE_URL`, variables de entorno; ningún proveedor es
  dependencia de la app.

## Arquitectura resultante

```
visitante → Cloudflare Pages (SPA, highcleansas.com)
              └─ /api/* → Worker (proxy) → Render (Node/Express) → Neon (Postgres)
                                              └── Resend (notificaciones, dominio ya verificado)
```

- Frontend: Cloudflare Pages, build `npm ci && npm run build`, salida `dist`, env de build
  `VITE_SITE_URL=https://highcleansas.com` (obligatoria: el prebuild de SEO aborta en
  producción si falta). Fallback de rutas SPA por `public/_redirects`.
- Worker: solo reenvía `/api/*` al `BACKEND_ORIGIN` de Render conservando headers, cuerpo
  y `Set-Cookie` (same-origin ⇒ la cookie funciona tal cual). Límites Free: 100.000
  req/día, 10 ms de CPU/invocación (proxy puro no se pasa), 128 MB, bundle ≤ 64 MiB.
- Backend: Render Web Service Docker (free, 750 h/mes, duerme a los 15 min, cold start
  ~30–60 s, 5 GB outbound/mes). `preDeployCommand: npm run db:deploy` hace las migraciones
  antes de publicar cada release. Uploads de CV persisten en la BD (FS efímero no afecta).
- BD: Neon Free (100 CU-h/mes, 0.5 GB, scale-to-zero con auto-resume, PgBouncer incluido,
  5 GB egress). El seed/migración inicial se ejecuta desde local contra Neon la primera
  vez (Render free no tiene one-off jobs).

## Archivos creados/modificados

| Archivo | Tipo |
| --- | --- |
| `docs/deployment/provider-comparison.md` | Nuevo — comparativa con fuentes y tabla corregida (5 GB) |
| `docs/deployment/GUIA-DEPLOY.md` | Nuevo — manual ejecutable del escenario A paso a paso |
| `docs/decisions/ADR-004-cookie-sesion-escenarios-deploy.md` | Modificado — resolución final = Escenario A |
| `deploy/cloudflare-worker/worker.ts` | Nuevo — proxy puro de `/api/*` |
| `deploy/cloudflare-worker/wrangler.toml` | Nuevo — configuración Worker (rutas + `BACKEND_ORIGIN`) |
| `deploy/backend/Dockerfile` | Nuevo — imagen Node 26 (multi-capa de construcción) |
| `render.yaml` | Nuevo — Blueprint Render (runtime docker, plan free, sync:false para secretos) |
| `app/backend/.env.production.example` | Nuevo — plantilla de variables de producción (sin secretos) |
| `app/frontend/public/_redirects` | Nuevo — fallback SPA de Cloudflare Pages |
| `docs/modules/MODULO-17-DEPLOY.md` | Nuevo — este documento |

## Dependencias

- Ninguna dependencia nueva en la app (regla "no dependencias innecesarias").
- Herramientas de la guía (wrangler CLI, cuentas Render/Neon/Cloudflare) se usan **en el
  momento del deploy** y quedan fuera del código del proyecto.

## API / Base de datos

- **Sin cambios**: no se crearon endpoints ni tablas tipo "deploy". El health check
  `/api/v1/health` se usa como `healthCheckPath` de Render.

## Seguridad

- Backend fail-closed en producción se mantiene: `CORS_ORIGIN` exacto (nunca `*`),
  `EMAIL_FROM` ≠ `onboarding@resend.dev`, `SESSION_SECRET` ≥ 32 caracteres real, credenciales
  admin reales, `RESEND_API_KEY` obligatoria. `env.ts` no arranca sin ellos.
- Secretos del deploy **nunca viajan en Git**: `render.yaml` usa `sync: false` para
  `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RESEND_API_KEY`,
  `NOTIFY_EMAIL_*`; `.env.production.example` incluye solo nombres y valores públicos.
- Cookie/CSRF sin cambios (mismo origen), ver ADR-004 actualizado.

## Testing / verificación

- No hubo cambios de código de runtime (solo config/docs/artefactos). Verificado:
  `lint` + `typecheck` + `build` óptimos en **backend y frontend**; `_redirects` se copia
  a `dist/` en el build de Vite; `render.yaml` es YAML válido y coherente con el Blueprint
  (campos `dockerfilePath`, `healthCheckPath`, `preDeployCommand`, `sync: false`).
- Rotación documentada para el día del deploy: checklist operativo completo en
  `GUIA-DEPLOY.md` (health, company, correos, cookie Secure, admin, chatbot, cold start).

## Git

Commits atómicos por archivo/conjunto (estilo Módulo 5+). **No se hace push sin
autorización explícita** (regla 5 del prompt maestro). Lista al cierre del módulo.

## Cómo modificar este módulo

- Cambiar proveedor → ajustar `provider-comparison.md` (fuente con fecha) y
  `GUIA-DEPLOY.md`; el worker/Render/Neon se sustituyen por config equivalente, la app no
  cambia (estándares).
- Subir a pago → seguir "Salir del free" de `provider-comparison.md` (backend desde $5/mes,
  Neon Launch o Render Postgres, R2 para fotos).

## Pendientes reales antes de publicar

- Confirmar con el cliente las **fotos reales** y los **servicios reales** (hoy hay
  placeholders/ciudades confirmadas aunque sin fotos del negocio).
- Crear cuentas Render y Neon (CERO ahora), verificar `notificaciones@highcleansas.com` en
  Resend como sender real, apuntar el dominio a Pages/Worker, y seguir el checklist de
  verificación.
- Después: **Módulo 18 — Google Search Console + indexación** (dominio nuevo: paciencia con
  la indexación).