import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { env } from '../../src/config/env.js'
import { getR2Client } from '../../src/lib/r2.js'
import { prisma } from '../../src/lib/prisma.js'

const BASE = env.R2_PUBLIC_BASE_URL as string
const BUCKET = env.R2_BUCKET_NAME as string

async function listKeys(): Promise<string[]> {
  const client = getR2Client()
  const keys: string[] = []
  let continuationToken: string | undefined
  do {
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        ContinuationToken: continuationToken,
      }),
    )
    for (const object of result.Contents ?? []) {
      if (object.Key) keys.push(object.Key)
    }
    continuationToken = result.NextContinuationToken
  } while (continuationToken)
  return keys
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'GET' })
    return response.ok
  } catch {
    return false
  }
}

const serviceKeyByLegacySlug: Record<string, string> = {
  'Aseo del Hogar': 'aseo-del-hogar',
  'Planchado': 'planchado',
  'Cuidado Adulto Mayor': 'cuidado-de-adulto-mayor',
  'Aseo Conjuntos Residenciales': 'conjuntos-residenciales',
  'Niñera': 'nineras',
  'Aseo de Oficinas': 'oficinas',
  'Limpieza Airbnb': 'alquiler-vacacional-airbnb',
}

async function main() {
  const keys = await listKeys()
  console.log(`Bucket: ${keys.length} objetos`)

  const services = await prisma.service.findMany()
  for (const service of services) {
    const slug = serviceKeyByLegacySlug[service.name]
    const candidates = keys.filter(
      (key) =>
        key.startsWith('services/') && slug && key.includes(slug),
    )
    const candidate = candidates[0]
    if (!candidate) {
      console.log(`  - ${service.name}: SIN clave candidata en bucket`)
      continue
    }
    const url = `${BASE}/${candidate}`
    const ok = await urlExists(url)
    if (!ok) {
      console.log(`  - ${service.name}: URL ${url} NO responde 2xx`)
      continue
    }
    await prisma.service.update({
      where: { id: service.id },
      data: { imageUrl: url },
    })
    console.log(`  - ${service.name}: imageUrl restaurada (${url})`)
  }

  const galleryCount = await prisma.galleryImage.count()
  console.log(`Galería en BD antes: ${galleryCount}`)

  if (galleryCount === 0) {
    const company = await prisma.company.findFirst()
    if (!company) throw new Error('Empresa no encontrada')

    const galleryKeys = keys
      .filter((key) => key.startsWith('gallery/'))
      .sort()
    for (const key of galleryKeys) {
      const url = `${BASE}/${key}`
      const ok = await urlExists(url)
      if (!ok) {
        console.log(`  - galería ${key}: URL no responde 2xx`)
        continue
      }
      const isVideo = /\.(mp4|webm|mov)/i.test(key)
      await prisma.galleryImage.create({
        data: {
          url,
          alt: `Imagen de galería: ${key}`,
          type: isVideo ? 'VIDEO' : 'IMAGE',
          companyId: company.id,
        },
      })
      console.log(`  - galería restaurada ${key} (${isVideo ? 'VIDEO' : 'IMAGE'})`)
    }
  }

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})