# Módulo 14 — SEO

## Qué se hizo
SEO on-page completo sobre el SPA existente **sin agregar dependencias** y **sin inventar ningún dato de negocio**: todos los labels y valores de Schema.org se toman de los endpoints públicos ya existentes (`/api/v1/company`, `/api/v1/reviews`, `/api/v1/services`). Incluye: componente `<Seo>` declarativo por página (title, description, Open Graph, Twitter, canonical), `manifest.webmanifest` + `theme-color`, `robots.txt` y `sitemap.xml` generados por un script de build, JSON-LD (`LocalBusiness`, reseñas con `AggregateRating`, `ItemList` de servicios) y una **validación en build time** que **aborta el build en producción si `VITE_SITE_URL` falta o apunta a localhost/IP local/dominio de ejemplo**.

> La indexación real (Google Search Console, envío del sitemap, solicitud de indexación) es el **Módulo 18**, que requiere primero el deploy (M17). Aquí se dejan preparados todos los archivos y metadatos que Google espera.

## Decisiones previas (usuario)
- **D1 (ajuste pedido en esta sesión)**: si `NODE_ENV === 'production'`, el build FALLA con un error claro cuando `VITE_SITE_URL` no está definida o sigue apuntando a localhost/127.0.0.1/0.0.0.0/dominio de ejemplo. Preferible "que el build truene ahora a que el SEO salga roto en silencio meses después".
- **D2 (punto de decisión del plan)**: no se definió la URL de producción (se espera dominio del cliente en M17). Se crea la **base configurable** `VITE_SITE_URL`: en dev/build local sin definir se usa `http://localhost:5173` con solo un aviso; en producción (`NODE_ENV=production`) es obligatoria y debe ser `https`.
- **D3**: JSON-LD y metas se inyectan en **tiempo de ejecución** (SPA sin SSR/prerender). Se documenta como evolución futura un prerender si Google lo requiere.
- **D4**: `og:image` usa el logo aprobado existente `/logo-transparente.png` (no se genera un PNG OG nuevo para no inventar diseño ni añadir assets binarios). Los íconos PWA usan ese logo + `favicon.svg`.

## Arquitectura

```
Página pública → <Seo title description canonicalPath jsonLd> → useLayoutEffect-equivalente (useEffect)
      │   document.title / meta[name=description] / meta[property=og:*] / meta[name=twitter:*]
      │   link[rel=canonical] y og:url → absoluteUrl (VITE_SITE_URL) si hay base, si no relativa
      └→ <script type=application/ld+json data-seo-ld> por bloque (se limpian al cambiar ruta)

src/lib/seo.ts ─ http://VITE_SITE_URL (getSiteUrl, absoluteUrl)
     ├─ localBusinessJson(company)        → @type LocalBusiness (datos reales de /company)
     ├─ reviewsJson(name, reviews)        → AggregateRating real (media + count) + review[]
     └─ servicesJson(services)            → @type ItemList de @type Service

npm run build → prebuild → node scripts/generate-seo-files.mjs
      loadEnv('production') + resolveSiteUrl: NODE_ENV=production ⇒ falla si la URL no es https válida
      → regenera public/sitemap.xml y public/robots.txt con la base (localhost fallback en dev)
```

- **Validación en build (D1)**: está en `scripts/generate-seo-files.mjs` (guard estricto, proceso node con el `NODE_ENV` real del shell). Además `vite.config.ts` tiene un plugin **solo de aviso** para builds directos (no falla los builds locales). ⚠️ **Matiz verificado**: Vite fija `process.env.NODE_ENV='production'` *dentro de su propio proceso* durante `vite build`, por eso el bloqueo estricto NO puede vivir en `vite.config.ts` sin romper los builds locales; vive en el prebuild (proceso hijo de `npm run build`).
- `loadEnv(mode, root, ['VITE_'])` lee `.env`, `.env.local`, `.env.production`, `.env.production.local` y las variables `VITE_*` del entorno.
- `robots.txt`: `Allow: /`, `Disallow: /admin`, `Disallow: /login`, `Sitemap:`.
- `sitemap.xml`: las 8 rutas públicas indexables con `changefreq=monthly` y `priority` (1.0 home, 0.9 servicios/contacto, 0.7 resto). `/login` y `/admin` quedan fuera.
- JSON-LD **nunca inventa campos**: solo se incluye lo que devuelve la API (teléfono, email, dirección si existen; el horario de `schedules` es texto libre y **no** se parsea a `openingHoursSpecification`).

## Archivos creados / modificados

### Frontend (única capa afectada; el backend no cambió: solo se leen endpoints públicos)
| Archivo | Descripción |
|---------|-------------|
| `src/components/Seo.tsx` | Componente declarativo: title/description/OG/Twitter/canonical/JSON-LD por ruta; limpia bloques anteriores al navegar |
| `src/lib/seo.ts` | `getSiteUrl`/`absoluteUrl` y builders JSON-LD (`LocalBusiness`, reseñas con `AggregateRating`, `ItemList` servicios) |
| `src/components/Seo.test.tsx` · `src/lib/seo.test.ts` | Tests (jsdom) de metas, canonical, OG y builders JSON-LD |
| `scripts/generate-seo-files.mjs` | Prebuild: valida `VITE_SITE_URL` en producción y regenera `sitemap.xml`/`robots.txt` |
| `scripts/seo-env.mjs` + `seo-env.d.mts` | Helpers puros `normalizeSiteUrl`/`isProductionValidSiteUrl`/`resolveSiteUrl` (+ tipado) |
| `scripts/seo-env.test.mjs` | Tests de los helpers y de las rutas públicas |
| `vite.config.ts` | Plugin `seo-env-warning` (aviso en build) |
| `index.html` | `manifest`, `theme-color`, base Open Graph/Twitter (fallback de las metas por página) |
| `public/manifest.webmanifest` | PWA básica (start_url `/`, standalone, theme `#749D5B`, logo + favicon) |
| `public/robots.txt` · `public/sitemap.xml` | Generados (se commitea el estado local por defecto; el build los regenera) |
| `.env.example` | Documenta `VITE_SITE_URL` (copiar a `.env.local`, gitignored) |
| `package.json` | Nuevo script `prebuild` |
| 8 páginas públicas (`Home`, `Servicios`, `Galeria`, `Nosotros`, `Resenas`, `Contacto`, `TrabajaConNosotros`, `PoliticaDeDatos`) | `title`/`description`/`canonicalPath`, y JSON-LD en Home (LocalBusiness), Reseñas (AggregateRating) y Servicios (ItemList) |

## Cómo funciona en la práctica
1. En dev **no hace falta nada**: sin `VITE_SITE_URL` el canonical queda relativo y los builders JSON-LD devuelven `null` (se omiten). El prebuild solo avisa.
2. Para ver canonical/OG/JSON-LD absolutos: crear `app/frontend/.env.local` con `VITE_SITE_URL=https://tudominio.com`.
3. Build de producción (CI o `NODE_ENV=production npm run build`): **falla** si `VITE_SITE_URL` falta o no es https válida → es imposible hacer deploy con SEO silenciosamente roto.

## Testing y calidad
- `npm test`: **45/45** (nuevos: `Seo.test.tsx` 4, `seo.test.ts` 8, `seo-env.test.mjs` 8).
- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run build` ✅ (aviso local de `VITE_SITE_URL`).
- Smoke real ✅: `robots.txt` 200 con disallow admin/login + sitemap; `sitemap.xml` 200 con las 8 rutas; `index.html` sirve manifest/theme-color/OG base. Las metas por página (title/canonical/JSON-LD) se cubren con jsdom (mismo runtime DOM que el navegador).

## Git (por capas, atómico)
Commits separados por responsabilidad: helpers de validación y su test → generador de sitemap/robots + prebuild → lib seo + test → componente Seo + test → manifest/index.html → montaje en páginas → vite.config + .env.example → docs/README → cierre AGENTS.md.

## Cómo modificarlo / evolucionar
- **Nueva página**: montar `<Seo title description canonicalPath jsonLd>` y, si aplica, añadir la ruta a `PUBLIC_PATHS` en `scripts/seo-env.mjs`.
- **Cambiar la URL base**: `VITE_SITE_URL` en `.env.local`/`.env.production` (nunca commitear valores reales en `.env`).
- **Prerender/SSR futuro**: las metas ya están centralizadas en `<Seo>`; portarlas a SSR es directo. El JSON-LD sigue el endpooint público, no requiere backend nuevo.
- **M18**: con dominio en mano, verificar `robots.txt`/`sitemap.xml` desplegados, Google Search Console → verificación → envío de sitemap → solicitud de indexación → seguimiento. Publicar no garantiza indexación inmediata.