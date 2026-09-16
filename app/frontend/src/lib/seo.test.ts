import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Company, Review, Service } from './api.ts'
import { absoluteUrl, getSiteUrl, localBusinessJson, reviewsJson, servicesJson } from './seo.ts'

afterEach(() => {
  vi.unstubAllEnvs()
})

const company: Company = {
  id: 'id',
  name: 'High Clean SAS',
  description: 'Empresa de aseo y limpieza profesional.',
  mission: null,
  vision: null,
  qualityPolicy: null,
  values: null,
  phone: '+57 300 000 0000',
  whatsappNumber: null,
  email: 'contacto@highclean.co',
  address: 'Bogotá, Colombia',
  schedules: null,
}

describe('seo', () => {
  describe('getSiteUrl', () => {
    it('devuelve la URL sin barra final', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      expect(getSiteUrl()).toBe('https://highclean.co')
    })

    it('devuelve cadena vacía si no está definida', () => {
      expect(getSiteUrl()).toBe('')
    })
  })

  describe('absoluteUrl', () => {
    it('arma URL absoluta combinando base y ruta', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      expect(absoluteUrl('/servicios')).toBe('https://highclean.co/servicios')
    })

    it('devuelve null sin base configurada', () => {
      expect(absoluteUrl('/servicios')).toBeNull()
    })
  })

  describe('localBusinessJson', () => {
    it('incluye solo los datos reales disponibles', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      const block = localBusinessJson(company)

      expect(block).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'High Clean SAS',
        telephone: '+57 300 000 0000',
        email: 'contacto@highclean.co',
        url: 'https://highclean.co/',
      })
      expect(block?.address).toEqual({
        '@type': 'PostalAddress',
        streetAddress: 'Bogotá, Colombia',
      })
    })

    it('devuelve null sin URL base', () => {
      expect(localBusinessJson(company)).toBeNull()
    })
  })

  describe('reviewsJson', () => {
    const reviews: Review[] = [
      {
        id: 'r1',
        author: 'Cliente A',
        content: 'Excelente servicio.',
        rating: 5,
        status: 'APPROVED',
        companyId: 'id',
        createdAt: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 'r2',
        author: 'Cliente B',
        content: 'Muy puntuales.',
        rating: 3,
        status: 'APPROVED',
        companyId: 'id',
        createdAt: '2026-09-05T00:00:00.000Z',
      },
    ]

    it('calcula aggregateRating real y lista las reseñas', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      const block = reviewsJson('High Clean SAS', reviews)

      expect(block?.aggregateRating).toEqual({
        '@type': 'AggregateRating',
        ratingValue: '4.0',
        reviewCount: 2,
      })
      expect(block?.review).toHaveLength(2)
      expect(block?.review?.[0]).toMatchObject({
        '@type': 'Review',
        author: { '@type': 'Person', name: 'Cliente A' },
        reviewBody: 'Excelente servicio.',
      })
    })

    it('devuelve null sin reseñas', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      expect(reviewsJson('High Clean SAS', [])).toBeNull()
    })
  })

  describe('servicesJson', () => {
    const services: Service[] = [
      { id: 's1', name: 'Aseo general', description: 'Limpieza integral.', companyId: 'id' },
    ]

    it('arma un ItemList con los servicios reales', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      const block = servicesJson(services) as { itemListElement: unknown[] }

      expect(block.itemListElement).toHaveLength(1)
      expect(block.itemListElement[0]).toMatchObject({
        '@type': 'ListItem',
        position: 1,
        item: { '@type': 'Service', name: 'Aseo general' },
      })
    })

    it('devuelve null sin servicios', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      expect(servicesJson([])).toBeNull()
    })
  })
})