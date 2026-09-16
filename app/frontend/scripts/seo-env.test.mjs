import { describe, expect, it } from 'vitest'
import {
  PUBLIC_PATHS,
  isProductionValidSiteUrl,
  normalizeSiteUrl,
  resolveSiteUrl,
} from './seo-env.mjs'

describe('seo-env', () => {
  describe('normalizeSiteUrl', () => {
    it('elimina la barra final y espacios', () => {
      expect(normalizeSiteUrl(' https://dominio.com/ ')).toBe(
        'https://dominio.com',
      )
    })

    it('devuelve null para valores vacíos o no string', () => {
      expect(normalizeSiteUrl('')).toBeNull()
      expect(normalizeSiteUrl(undefined)).toBeNull()
      expect(normalizeSiteUrl(null)).toBeNull()
      expect(normalizeSiteUrl('   ')).toBeNull()
    })
  })

  describe('isProductionValidSiteUrl', () => {
    it('acepta https con dominio real', () => {
      expect(isProductionValidSiteUrl('https://highclean.co/')).toBe(true)
    })

    it('rechaza http', () => {
      expect(isProductionValidSiteUrl('http://highclean.co')).toBe(false)
    })

    it('rechaza localhost e IPs locales', () => {
      expect(isProductionValidSiteUrl('https://localhost:5173')).toBe(false)
      expect(isProductionValidSiteUrl('https://127.0.0.1')).toBe(false)
      expect(isProductionValidSiteUrl('https://0.0.0.0')).toBe(false)
    })

    it('rechaza URLs inválidas y vacías', () => {
      expect(isProductionValidSiteUrl('no-es-una-url')).toBe(false)
      expect(isProductionValidSiteUrl(undefined)).toBe(false)
    })
  })

  describe('resolveSiteUrl', () => {
    it('modo estricto lanza error claro sin VITE_SITE_URL', () => {
      expect(() =>
        resolveSiteUrl({}, { strict: true }),
      ).toThrowError(/VITE_SITE_URL no está definida/)
    })

    it('modo estricto lanza error claro con URL local', () => {
      expect(() =>
        resolveSiteUrl(
          { VITE_SITE_URL: 'http://localhost:5173' },
          { strict: true },
        ),
      ).toThrowError(/no es una URL https válida/)
    })

    it('modo estricto acepta URL de producción válida', () => {
      const result = resolveSiteUrl(
        { VITE_SITE_URL: 'https://highclean.co/' },
        { strict: true },
      )
      expect(result.url).toBe('https://highclean.co')
      expect(result.warning).toBeNull()
    })

    it('modo no estricto usa fallback local y avisa', () => {
      const result = resolveSiteUrl({}, { strict: false })
      expect(result.url).toBe('http://localhost:5173')
      expect(result.warning).toBeTruthy()
    })
  })

  it('expone las rutas públicas indexables', () => {
    expect(Array.isArray(PUBLIC_PATHS)).toBe(true)
    expect(PUBLIC_PATHS).toContain('/')
    expect(PUBLIC_PATHS).toContain('/contacto')
    expect(PUBLIC_PATHS).not.toContain('/admin')
  })
})