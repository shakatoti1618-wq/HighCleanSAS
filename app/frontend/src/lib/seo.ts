import type { Company, Review, Service } from './api.ts'

export function getSiteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL as string | undefined
  if (!raw) return ''
  return raw.replace(/\/+$/, '')
}

export function absoluteUrl(path: string): string | null {
  const siteUrl = getSiteUrl()
  if (!siteUrl) return null
  return new URL(path, siteUrl).toString()
}

interface LocalBusiness {
  '@context': 'https://schema.org'
  '@type': string
  name: string
  description?: string
  url?: string
  image?: string
  telephone?: string
  email?: string
  address?: { '@type': 'PostalAddress'; streetAddress: string }
}

interface ReviewBlock extends LocalBusiness {
  aggregateRating?: { '@type': 'AggregateRating'; ratingValue: string; reviewCount: number }
  review?:
    | {
        '@type': 'Review'
        author: { '@type': 'Person'; name: string }
        reviewRating: { '@type': 'Rating'; ratingValue: number }
        reviewBody?: string
        datePublished?: string
      }[]
    | undefined
}

export function localBusinessJson(company: Company): LocalBusiness | null {
  const url = absoluteUrl('/')
  if (!url) return null

  const block: LocalBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    url,
    image: absoluteUrl('/logo-transparente.png') ?? undefined,
  }

  if (company.description) block.description = company.description
  if (company.phone) block.telephone = company.phone
  if (company.email) block.email = company.email
  if (company.address) {
    block.address = {
      '@type': 'PostalAddress',
      streetAddress: company.address,
    }
  }

  return block
}

function toIsoDate(value: string): string | undefined {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function reviewsJson(
  companyName: string,
  reviews: Review[],
): ReviewBlock | null {
  const url = absoluteUrl('/resenas')
  if (!url || reviews.length === 0) return null

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: companyName,
    url,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: average.toFixed(1),
      reviewCount: reviews.length,
    },
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.author },
      reviewRating: { '@type': 'Rating', ratingValue: review.rating },
      ...(review.content ? { reviewBody: review.content } : {}),
      ...(review.createdAt ? { datePublished: toIsoDate(review.createdAt) } : {}),
    })),
  }
}

export function servicesJson(services: Service[]): object | null {
  const url = absoluteUrl('/servicios')
  if (!url || services.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Servicios de limpieza',
    url,
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.name,
        ...(service.description ? { description: service.description } : {}),
      },
    })),
  }
}