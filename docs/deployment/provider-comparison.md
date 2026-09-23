# Comparativa de proveedores — Tier gratuitos (investigado en 2026-09)

> Investigación de tiers gratuitos **al 23 de septiembre de 2026**, a partir de la
> documentación oficial de cada proveedor y fuentes independientes con fecha.
> **No inventamos precios ni límites**: cada cifra viene de la fuente citada; antes de
> elegir un plan, verifica contra la página oficial porque los límites cambian.
> Ninguna dependencia de Railway/Vercel/Render/etc.: la app solo usa estándares
> (`DATABASE_URL`, variables de entorno).

## Decisión (confirmada por Jonathan, 2026-09-23)

| Capa | Proveedor | Tier |
| --- | --- | --- |
| Frontend (SPA + proxy `/api/*`) | **Cloudflare Pages** + **Cloudflare Worker** | Free |
| Backend (Node/Express — `build` → `node dist/server.js`) | **Render** | Free (web service) |
| Base de datos | **Neon** | Free |

Arquitectura elegida: **mismo origen (Escenario A de ADR-004)** — el sitio vive en
`highcleansas.com`, un Worker de Cloudflare reenvía `/api/*` al backend, y el navegador
solo ve un origen. No hay cambios a la cookie (`sameSite: 'lax'`, `secure: 'auto'`) ni a
la mitigación CSRF.

---

## Frontend (sitio estático SPA)

| Proveedor | Tier gratis | Límites y condiciones | ¿Usamos? |
| --- | --- | --- | --- |
| **Cloudflare Pages** | Free, sin tarjeta | Sitios ilimitados, **bandwidth ilimitado**, assets estáticos ilimitados y gratis, **500 builds/mes**, 1 build en paralelo, timeout 20 min por build, **20.000 archivos por sitio**, 25 MiB por archivo, hasta **100 dominios custom** por proyecto, TLS gestionado gratis. | ✅ |
| Vercel (Hobby) | Free | 100 GB bandwidth, 1M invocaciones serverless/mes; **prohibido uso comercial**. | No |
| Netlify (Free) | Free | Bandwidth/funciones limitadas, permisos de build mensuales. | No |
| Render Static Site | Free | Ilimitadas, pero **cuenta contra el bandwidth de outbound del workspace (5 GB/mes)**; el sitio aquí usa relaciones dinámicas → mejor Pages. | No |

**Fuente:** docs oficiales Cloudflare Pages Limits (2026-07), dev.to "Cloudflare Pages Pricing 2026" (2026-09-09), eastondev (2026-05), Render docs "Deploy for Free".

### Detalle del proxy `/api/*` (Cloudflare Workers Free)

Los requests que invocan un Worker (incluido el proxy de `/api/*`) se cobran contra el
plan **Workers Free**, aunque el sitio sea Pages:

| Límite | Workers Free |
| --- | --- |
| Requests | **100.000/día** (resetean 00:00 UTC; exceder → error 1027) |
| CPU time por invocación | **10 ms** (tiempo de CPU, **no** wall-clock; esperar al upstream no cuenta → un proxy puro entra holgado) |
| Memoria | 128 MB |
| Subrequests por invocación | 50 |
| Tamaño del bundle | **64 MiB** (subió de 3 MB en septiembre 2026) |
| Body máx. de request | 100 MB (plan CF Free) |

**Fuente:** developers.cloudflare.com/workers/platform/limits (2026-09-04), pricing de Workers, shattered.io (2026-09-07).

---

## Backend (Node/Express, Node 26, `npm run build` → `node dist/server.js`)

| Proveedor | Tier gratis | Límites y condiciones | Veredicto |
| --- | --- | --- | --- |
| **Render — Web Service Free** | Sin tarjeta, permanente, **750 h de instancia/mes** por workspace | 512 MB RAM / 0.1 vCPU; **duerme tras 15 min inactivo** y el cold start tarda ~30–60 s; **luego de dormir el FS efímero pierde datos** (para nosotros OK: los CV van en la BD); **5 GB outbound/mes por workspace** (plan Hobby; excedente $0.15/GB; sin tarjeta → suspende lo que quede de mes); sin workers/cron; 500 build-min/mes; **el doc oficial dice "no uses free para producción"**. 750 h ≥ 744 h/mes → puede estar ~24/7. | ✅ **Elegido** |
| Railway — Free | Trial 30 días con **$5 de crédito único** (1 GB RAM/2 vCPU shard) → luego Free **$0/mes con $1 de crédito/mes** (1 vCPU/0.5 GB, 1 réplica, logs 3 días) | Uso por segundo (RAM $10/GB·mes, vCPU $20/vCPU·mes, egress $0.05/GB): **el $1 no mantiene nada encendido todo el mes**; "App Sleeping" reduce costo pero es temporal. | No (no es "always-on" gratis) |
| Koyeb — Hobby | Sin tarjeta, *forever*: 1 web service gratis (512 MB/0.1 vCPU/2 GB SSD, regiones Frankfurt/DC), scale-to-zero; 1 Postgres gratis (5 h activas/mes, 1 GB) | **Sin dominios custom en Hobby** (no aplica: el Worker lo llama por su URL `*.koyeb.app`); cold start en cada activación; **adquirido por Mistral (2026)** → roadmap con incertidumbre. | Alternativa (runner-up) |
| Fly.io | Solo **trial: 7 días o 2 h de runtime** | Tras el trial **requiere tarjeta; no hay free tier**; las "3 máquinas de 256 MB" del free allowance histórico ya no aplican. | ❌ Descartado |

**Fuentes:** render.com/docs/free + render.com/docs/outbound-bandwidth (Hobby = **5 GB/mes**, `$0.15/GB` después; usos: 750 h, duerme 15 min, cold start ~1 min, Postgres free expira a 30 días y sin backups), render.com/docs/compute-plans (free = 0.1 CPU/512 MB), railway.com/pricing + docs.railway.com/pricing (crédito Free $1/mes, trial $5/30 días, egress $0.05/GB), koyeb.com/docs/faqs/pricing (Hobby gratis, sin dominios custom en Hobby, Postgres 5 h/mes, 512 MB/0.1 vCPU/2 GB), fly.io/docs/about/free-trial (2 h o 7 días) y fly.io/docs/about/billing, flaviocopes.com "Every hosting provider's free tier" (2026-09-23).

### Nota sobre el bandwidth de Render (corrección confirmada)

- **Render Free (plan de workspace Hobby) incluye 5 GB de outbound al mes**, no 100 GB.
  Verificado en `render.com/docs/outbound-bandwidth.md` (tabla oficial: Hobby 5 GB ·
  Pro 25 GB · Scale 1 TB) y corroborado por fuentes independientes de septiembre de 2026.
  Los "100 GB" circulan de artículos del tier antiguo (2022–2023).
- Neon Free también incluye 5 GB de egress/mes (coincidencia numérica, no es el mismo dato).
- Con nuestro tráfico actual (un sitio corporativo con admin) 5 GB/mes alcanza de sobra.

---

## Base de datos (PostgreSQL)

| Proveedor | Tier gratis | Límites y condiciones | Veredicto |
| --- | --- | --- | --- |
| **Neon Free** | Sin tarjeta, **no expira**, 100 proyectos | **100 CU-horas/mes** por proyecto (0.25 CU ≈ 1 GB RAM, ~104 conexiones máx.); compute **scale-to-zero a los 5 min de inactividad con auto-resume automático (~ms, sin intervención)**; **PgBouncer/pooler incluido** (10.000 clientes); 10 branches; **5 GB egress/mes**; 0.5 GB de almacenamiento; historial 6 h. Superar CU-horas o egress → compute pausado hasta el mes siguiente. | ✅ **Elegido** |
| Supabase Free | Sin tarjeta, 2 proyectos activos | 500 MB BD, 1 GB storage, **5 GB egress**, 50k MAU, Micro (shared CPU/RAM); **se pausa tras 1 semana de inactividad y hay que restaurarla a mano** (hasta ~60 s de cold start; login/admin caídos mientras tanto); sin backups. | No (pausa manual en temporadas muertas) |
| Render Postgres Free | 1 BD por workspace, 1 GB | **Expira a los 30 días** + 14 días de gracia, luego se borra; sin backups ni pooling. | ❌ (no es permanente) |
| Koyeb Postgres Free | 1 BD, 1 GB | **5 horas activas/mes**: insuficiente. | ❌ |
| Railway (Postgres) | Solo dentro del trial $5 | Servicio de pago real (aprox. $87,50/mes el básico según comparativa 2026-09-18). | ❌ |

**Fuentes:** neon.com manuals + GitHub (2026-04): "Free plan: 0.5 GB, 100 CU-h, egress 5 GB, scale-to-zero 5 min, sin tarjeta, no expira"; supabase.com/pricing + changelog + "Project Pausing" (Free: 500 MB, 5 GB egress, **pausa tras 1 semana de inactividad**, 2 proyectos, Micro); render.com/docs/free (Postgres free: 1 GB, expira 30 días).

---

## Plan de escalado (cuando haya fotos/servicios reales y tráfico estable)

| Momento | Cambio recomendado | Costo aprox. (sept 2026, verificar) |
| --- | --- | --- |
| Lanzamiento lento / pocas visitas | Mantener Free (Render + Neon) | $0 |
| Tráfico real constante | Backend: plan `0.5c-512mb` ($7/mes) o Railway Hobby ($5/mes) para eliminar cold start y sleep | $5–7/mes |
| BD con bola de nieve | Neon Launch (pay-as-you-go: ~$0.106/CU-h, $0.35/GB-mes) o Render Postgres desde $6/mes | variable |
| CDN/imágenes | Migrar galería a R2 (incluido 10 GB gratis en CF) cuando se suban fotos reales | $0 |

## Consecuencias del escenario elegido

- **Cookie/CSRF intactos**: mismo origen → `sameSite:'lax'`, `secure:'auto'`, `requireSameOrigin` y `CORS_ORIGIN=https://highcleansas.com` sin `sameSite:none`. Se refleja en `ADR-004`.
- **Coste de frialdad**: Render free duerme a los 15 min y el **primer visitante tras una pausa espera ~30–60 s** mientras despierta. Aceptable hoy; se documenta en la guía (y se elimina con el plan de pago).
- **FS efímero**: ya no afecta: subidas de CV se persisten en la BD (`fileData`), no en disco.
- **Límite de requests al Worker** (100.000/día) da holgura extrema (admin interno + formularios).