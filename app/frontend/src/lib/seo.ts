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

export interface OpeningHoursSpec {
  '@type': 'OpeningHoursSpecification'
  dayOfWeek: string[]
  opens: string
  closes: string
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
  areaServed?: { '@type': 'City'; name: string }[]
  openingHoursSpecification?: OpeningHoursSpec[]
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
  if (company.serviceCities && company.serviceCities.length > 0) {
    block.areaServed = company.serviceCities.map((name) => ({
      '@type': 'City',
      name,
    }))
  }
  const openingHours = openingHoursFromSchedules(company.schedules)
  if (openingHours) block.openingHoursSpecification = openingHours

  return block
}

const WEEK_DAYS = [
  { key: 'lunes', schema: 'Monday' },
  { key: 'martes', schema: 'Tuesday' },
  { key: 'miercoles', schema: 'Wednesday' },
  { key: 'jueves', schema: 'Thursday' },
  { key: 'viernes', schema: 'Friday' },
  { key: 'sabado', schema: 'Saturday' },
  { key: 'domingo', schema: 'Sunday' },
] as const

const DAY_BY_KEY = new Map<string, string>(
  WEEK_DAYS.map((day) => [day.key, day.schema]),
)

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function schemaDay(key: string): string | undefined {
  return DAY_BY_KEY.get(key)
}

function parseDaysPart(part: string): string[] | null {
  const text = normalize(part).replace(/^(de|desde)\s+/, '')
  const segments = text
    .split(/\s+(?:y|and)\s+|[,;]/)
    .map((segment) => segment.trim())
    .filter(Boolean)

  const days: string[] = []
  for (const segment of segments) {
    const match = segment.match(/^(\w+)(?:\s+a\s+(\w+))?$/)
    if (!match) return null

    const from = schemaDay(match[1] ?? '')
    if (!from) return null

    const to = match[2] ? schemaDay(match[2]) : undefined
    if (match[2] && !to) return null

    if (to) {
      const fromIndex = WEEK_DAYS.findIndex((day) => day.schema === from)
      const toIndex = WEEK_DAYS.findIndex((day) => day.schema === to)
      if (fromIndex < 0 || toIndex < 0 || fromIndex > toIndex) return null
      days.push(...WEEK_DAYS.slice(fromIndex, toIndex + 1).map((day) => day.schema))
    } else {
      days.push(from)
    }
  }

  if (days.length === 0) return null
  return [...new Set(days)]
}

function parseHour(raw: string): string | null {
  const match = raw.toLowerCase().match(/^(\d{1,2}):(\d{2})\s*([ap]\.?m\.?)?$/)
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  const meridian = match[3]

  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null

  let hour24 = hour
  if (meridian) {
    if (meridian.startsWith('p')) {
      hour24 = hour === 12 ? 12 : hour + 12
    } else {
      hour24 = hour === 12 ? 0 : hour
    }
  }

  const hh = String(hour24).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  return `${hh}:${mm}`
}

function parseScheduleLine(line: string): OpeningHoursSpec | null {
  const [daysPart, ...rest] = line.split(':')
  if (!daysPart || rest.length === 0) return null

  const dayOfWeek = parseDaysPart(daysPart)
  if (!dayOfWeek) return null

  const timePart = rest.join(':')
  const match = timePart.match(
    /(\d{1,2}:\d{2}\s*[ap]?\.?m?\.?)\s+(?:de\s+)?a\s+(\d{1,2}:\d{2}\s*[ap]?\.?m?\.?)/,
  )
  if (!match) return null

  const opens = parseHour(match[1] ?? '')
  const closes = parseHour(match[2] ?? '')
  if (!opens || !closes) return null

  return {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek,
    opens,
    closes,
  }
}

export function openingHoursFromSchedules(
  schedules: string | null | undefined,
): OpeningHoursSpec[] | null {
  if (!schedules) return null

  const lines = schedules
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const specs: OpeningHoursSpec[] = []
  for (const line of lines) {
    const spec = parseScheduleLine(line)
    if (spec) specs.push(spec)
  }

  return specs.length > 0 ? specs : null
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