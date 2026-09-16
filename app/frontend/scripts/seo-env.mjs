const PUBLIC_PATHS = [
  '/',
  '/servicios',
  '/galeria',
  '/nosotros',
  '/resenas',
  '/contacto',
  '/trabaja-con-nosotros',
  '/politica-de-datos',
]

const FORBIDDEN_HOST_PATTERN =
  /localhost|127\.0\.0\.1|0\.0\.0\.0|\.local$|\.test$|example\.(com|org|net)$/

export function normalizeSiteUrl(raw) {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  return trimmed.replace(/\/+$/, '')
}

export function isProductionValidSiteUrl(raw) {
  const normalized = normalizeSiteUrl(raw)
  if (!normalized) return false

  let parsed
  try {
    parsed = new URL(normalized)
  } catch {
    return false
  }

  if (parsed.protocol !== 'https:') return false
  return !FORBIDDEN_HOST_PATTERN.test(parsed.hostname.toLowerCase())
}

export function resolveSiteUrl(env, { strict, fallback = 'http://localhost:5173' }) {
  const raw = normalizeSiteUrl(env?.VITE_SITE_URL)

  if (isProductionValidSiteUrl(raw)) {
    return { url: raw, warning: null }
  }

  if (strict) {
    const reason = raw
      ? `VITE_SITE_URL="${raw}" no es una URL https válida para producción (no puede apuntar a localhost, IP local ni dominios de ejemplo).`
      : 'VITE_SITE_URL no está definida (revisa app/frontend/.env.local o app/frontend/.env.production).'
    throw new Error(`[seo] Validación fallida en build de producción: ${reason}`)
  }

  const url = raw ?? fallback
  const warning = raw
    ? `VITE_SITE_URL apunta a "${url}", que no es una URL de producción válida. El SEO generado quedará con esa base.`
    : `VITE_SITE_URL no definida. Usando "${url}" como base local para sitemap.xml/robots.txt. En producción el build falla si no se define.`
  return { url, warning }
}

export { PUBLIC_PATHS }