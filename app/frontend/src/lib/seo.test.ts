import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Company, Review, Service } from './api.ts'
import {
  absoluteUrl,
  getSiteUrl,
  localBusinessJson,
  openingHoursFromSchedules,
  reviewsJson,
  servicesJson,
} from './seo.ts'

afterEach(() => {
  vi.unstubAllEnvs()
})

const company: Company = {
  id: 'id',
  name: 'High Clean SAS',
  nit: '901330960-1',
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
  serviceCities: null,
  activeClients: null,
  yearsOperating: null,
  monthlyServices: null,
}

const baseCompany: Company = {
  id: 'c1',
  name: 'High Clean SAS',
  nit: '901330960-1',
  description: 'Empresa de limpieza',
  mission: null,
  vision: null,
  qualityPolicy: null,
  values: null,
  phone: '+573209498347',
  whatsappNumber: null,
  email: 'cotizaciones@highcleansas.com',
  address: null,
  schedules:
    'Lunes a viernes: 8:00 am a 5:00 pm\nSábado y domingo: 8:00 am a 12:00 pm',
  serviceCities: ['Bogotá', 'Villavicencio', 'Bucaramanga'],
  activeClients: null,
  yearsOperating: null,
  monthlyServices: null,
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

    it('incluye teléfono, correo y datos de cobertura', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      const block = localBusinessJson(baseCompany)

      expect(block?.telephone).toBe('+573209498347')
      expect(block?.email).toBe('cotizaciones@highcleansas.com')
      expect(block?.areaServed).toEqual([
        { '@type': 'City', name: 'Bogotá' },
        { '@type': 'City', name: 'Villavicencio' },
        { '@type': 'City', name: 'Bucaramanga' },
      ])
      expect(block?.openingHoursSpecification).toHaveLength(2)
      expect(block?.openingHoursSpecification?.[0]).toEqual({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      })
      expect(block?.openingHoursSpecification?.[1]).toEqual({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '08:00',
        closes: '12:00',
      })
    })

    it('omite areaServed cuando no hay ciudades de cobertura', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      const block = localBusinessJson({ ...baseCompany, serviceCities: [] })

      expect(block?.areaServed).toBeUndefined()
    })

    it('omite openingHoursSpecification con texto de horarios no reconocido, sin romper el resto', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      const block = localBusinessJson({
        ...baseCompany,
        schedules: 'Atendemos de lunes a sábado sin horario fijo',
      })

      expect(block?.openingHoursSpecification).toBeUndefined()
      expect(block?.name).toBe('High Clean SAS')
      expect(block?.telephone).toBe('+573209498347')
      expect(block?.email).toBe('cotizaciones@highcleansas.com')
      expect(block?.areaServed).toHaveLength(3)
    })

    it('omite openingHoursSpecification cuando schedules es null', () => {
      vi.stubEnv('VITE_SITE_URL', 'https://highclean.co/')
      const block = localBusinessJson({ ...baseCompany, schedules: null })

      expect(block?.openingHoursSpecification).toBeUndefined()
      expect(block?.areaServed).toHaveLength(3)
    })

    it('devuelve null sin URL base', () => {
      expect(localBusinessJson(company)).toBeNull()
    })
  })

  describe('openingHoursFromSchedules', () => {
    it('omite una línea con formato no reconocido', () => {
      const specs = openingHoursFromSchedules('Lunes a viernes de 8 a 5pm')

      expect(specs).toBeNull()
    })

    it('omite el bloque completo si ninguna línea se reconoce', () => {
      const specs = openingHoursFromSchedules('Abierto 24 horas, todos los días')

      expect(specs).toBeNull()
    })

    it('conserva las líneas reconocidas y descarta las que no', () => {
      const specs = openingHoursFromSchedules(
        'Lunes a viernes: 8:00 am a 5:00 pm\nFeriados: de 9 a 10',
      )

      expect(specs).toHaveLength(1)
      expect(specs?.[0]?.dayOfWeek).toEqual([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
      ])
    })

    it('convierte horas am/pm a formato 24h', () => {
      const specs = openingHoursFromSchedules(
        'Sábado: 8:00 am a 12:00 pm\nDomingo: 12:00 pm a 6:00 pm',
      )

      expect(specs?.[0]).toMatchObject({ opens: '08:00', closes: '12:00' })
      expect(specs?.[1]).toMatchObject({ opens: '12:00', closes: '18:00' })
    })

    it('devuelve null con schedules vacío', () => {
      expect(openingHoursFromSchedules(null)).toBeNull()
      expect(openingHoursFromSchedules('')).toBeNull()
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
      {
        id: 's1',
        name: 'Aseo general',
        description: 'Limpieza integral.',
        imageUrl: null,
        companyId: 'id',
        options: [],
      },
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