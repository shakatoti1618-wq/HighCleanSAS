# Módulo 18 — Search Console + Indexación

## Qué se hizo
Se configuró Google Search Console (GSC) para el dominio `highcleansas.com`, se envió el sitemap.xml y se solicitó indexación de las URLs principales del sitio.

## Arquitectura
- **Dominio**: `highcleansas.com` (ya en Cloudflare, DNS verificado)
- **Sitemap**: `https://highcleansas.com/sitemap.xml` (generado en build vía `scripts/generate-seo-files.mjs`)
- **Robots.txt**: `https://highcleansas.com/robots.txt` (generado en build, permite todo salvo `/admin` y `/login`)
- **Worker proxy**: `/api/*` → Render backend
- **Frontend**: Cloudflare Pages (`highcleansas.pages.dev` + dominio personalizado `highcleansas.com`)

## Pasos ejecutados

### 1. Google Search Console - Propiedad de dominio
1. Acceder a https://search.google.com/search-console
2. **Add property** → **Domain** → `highcleansas.com`
3. Verificación DNS:
   - Cloudflare ya gestiona el DNS de `highcleansas.com`
   - GSC proporciona registro TXT → agregado en Cloudflare DNS
   - Verificación automática (Cloudflare propaga rápido)
4. Propiedad verificada ✅

### 2. Sitemap.xml
- URL: `https://highcleansas.com/sitemap.xml`
- Contiene 8 URLs: `/`, `/servicios`, `/galeria`, `/nosotros`, `/resenas`, `/contacto`, `/trabaja-con-nosotros`, `/politica-de-datos`
- Enviado en GSC: **Sitemaps** → **Add new sitemap** → `https://highcleansas.com/sitemap.xml` → **Submit**
- Estado: **Success** / **Discovered** ✅

### 3. Robots.txt
- URL: `https://highcleansas.com/robots.txt`
- Permite todo (`User-agent: *` + `Allow: /`)
- Bloquea: `/admin`, `/login`
- Referencia sitemap: `Sitemap: https://highcleansas.com/sitemap.xml`

### 4. Solicitud de indexación (URL Inspection)
URLs enviadas a **URL Inspection** → **Request Indexing**:
- `https://highcleansas.com/`
- `https://highcleansas.com/servicios`
- `https://highcleansas.com/contacto`
- `https://highcleansas.com/trabaja-con-nosotros`
- `https://highcleansas.com/nosotros`
- `https://highcleansas.com/galeria`
- `https://highcleansas.com/resenas`
- `https://highcleansas.com/politica-de-datos`

Todas con estado: **Indexing requested** / **URL is on Google** (pendiente crawl) ✅

### 5. Monitoreo continuo (GSC)
- **Performance** → clicks, impressions, CTR, position
- **Indexing > Pages** → indexadas vs excluidas
- **Experience > Core Web Vitals** → LCP, CLS, INP
- **Security & Manual Actions** → sin problemas

## Archivos relacionados
- `scripts/generate-seo-files.mjs` → genera `sitemap.xml` + `robots.txt` + `manifest.webmanifest` en `prebuild`
- `vite.config.ts` → configura `prebuild` script
- `deploy/cloudflare-worker/worker.ts` → proxy `/api/*` a Render
- `docs/deployment/GUIA-DEPLOY.md` → actualizado con pasos GSC

## Verificación de despliegue
- `curl https://highcleansas.com/sitemap.xml` → 200 OK, XML válido
- `curl https://highcleansas.com/robots.txt` → 200 OK, reglas correctas
- GSC > Sitemaps > Status: **Success**
- GSC > URL Inspection > todas las URLs > **Indexing requested**

## Próximos pasos (post-lanzamiento)
1. Monitorear **Coverage** en GSC semanalmente
2. Revisar **Core Web Vitals** mensualmente
3. Enviar nuevas URLs a indexación cuando se agreguen páginas
4. Configurar **Search Console alerts** (email) para alertas de indexación

## Problemas conocidos
- **Emails de notificación** (contacto / postulaciones) tienen delay en Gmail (revisar Spam/Promociones). Resend los envía correctamente (IDs en logs).
- **401 en `/api/v1/auth/me`** en consola: bug frontend (falta `credentials: 'include'` en `fetch`), no afecta funcionalidad.
- **Redirect www → apex** via `_redirects` en propagación Cloudflare Pages (2-5 min).
- **Emails de notificación** tardan en llegar a Gmail (revisar Spam/Promociones). Resend logs muestran **Delivered**.

## Commits
- `docs: add Módulo 18 Search Console + Indexación documentation`
- `docs: update GUIA-DEPLOY.md with GSC steps`

## Estado final
✅ **Módulo 18 completado** - Search Console configurado, sitemap enviado, indexación solicitada, monitoreo activo.