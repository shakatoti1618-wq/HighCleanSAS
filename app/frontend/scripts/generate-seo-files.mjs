import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { PUBLIC_PATHS, resolveSiteUrl } from './seo-env.mjs'

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = resolve(frontendRoot, 'public')

const mode = process.argv[2] ?? 'production'
const env = loadEnv(mode, frontendRoot, ['VITE_'])
const strict = process.env.NODE_ENV === 'production'
const { url, warning } = resolveSiteUrl(env, {
  strict,
  fallback: 'http://localhost:5173',
})

if (warning) {
  console.warn(`[seo] ${warning}`)
}

const priorityFor = (path) => {
  if (path === '/') return '1.0'
  if (path === '/servicios' || path === '/contacto') return '0.9'
  return '0.7'
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_PATHS.map(
  (path) => `  <url>
    <loc>${url}${path === '/' ? '/' : path}</loc>
    <changefreq>monthly</changefreq>
    <priority>${priorityFor(path)}</priority>
  </url>`,
).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /login

Sitemap: ${url}/sitemap.xml
`

await mkdir(publicDir, { recursive: true })
await Promise.all([
  writeFile(resolve(publicDir, 'sitemap.xml'), sitemap, 'utf8'),
  writeFile(resolve(publicDir, 'robots.txt'), robots, 'utf8'),
])

console.log('[seo] sitemap.xml y robots.txt generados en public/')