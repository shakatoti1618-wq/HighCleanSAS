import 'dotenv/config'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { prisma } from '../../src/lib/prisma.js'
import { uploadObject } from '../../src/services/storage.service.js'
import {
  extnameOf,
  mediaTypeOf,
  safeObjectKey,
  slugify,
} from '../../src/utils/media.js'

const DOWNLOADS = path.join(os.homedir(), 'Downloads')

const SERVICES: Array<{ name: string; fileName: string }> = [
  { name: 'Aseo del Hogar', fileName: 'hogar.jpeg' },
  { name: 'Planchado', fileName: 'planchado.jpeg' },
  { name: 'Cuidado de Adulto Mayor', fileName: 'adultomayor.jpeg' },
  { name: 'Conjuntos Residenciales', fileName: 'conjuntos.jpeg' },
  { name: 'Niñeras', fileName: 'niñeras.jpeg' },
  { name: 'Oficinas', fileName: 'oficinas.jpeg' },
  { name: 'Alquiler Vacacional (Airbnb)', fileName: 'airbnb.jpeg' },
]

const GALLERY_DIR = path.join(DOWNLOADS, 'galeriahighclean')

function contentTypeOf(fileName: string): string {
  const ext = extnameOf(fileName) ?? ''
  switch (ext) {
    case '.png':
      return 'image/png'
    case '.webp':
      return 'image/webp'
    case '.mp4':
      return 'video/mp4'
    case '.webm':
      return 'video/webm'
    default:
      return 'image/jpeg'
  }
}

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(20_000),
    })
    return response.ok
  } catch {
    return false
  }
}

const results: Array<{ tipo: string; nombre: string; url: string; estado: string }> = []
let exitCode = 0

async function main() {
  const company = await prisma.company.findFirst()
  if (!company) {
    console.error('ERROR: no existe una empresa configurada en la base de datos.')
    console.error('Ejecuta primero: npm run db:seed')
    exitCode = 1
    return
  }

  for (const serviceSpec of SERVICES) {
    const filePath = path.join(DOWNLOADS, serviceSpec.fileName)
    if (!existsSync(filePath)) {
      results.push({ tipo: 'servicio', nombre: serviceSpec.name, url: filePath, estado: 'FALTA ARCHIVO' })
      exitCode = 1
      continue
    }

    let service = await prisma.service.findFirst({ where: { name: serviceSpec.name } })
    if (!service) {
      service = await prisma.service.create({
        data: { name: serviceSpec.name, companyId: company.id },
      })
    }

    const ext = extnameOf(serviceSpec.fileName) ?? '.jpeg'
    const key = `services/${slugify(serviceSpec.name)}${ext}`
    const { url } = await uploadObject(
      key,
      new Uint8Array(readFileSync(filePath)),
      contentTypeOf(serviceSpec.fileName),
    )

    await prisma.service.update({ where: { id: service.id }, data: { imageUrl: url } })
    results.push({ tipo: 'servicio', nombre: serviceSpec.name, url, estado: 'SUBIDO' })
  }

  if (!existsSync(GALLERY_DIR)) {
    console.error(`ERROR: no existe la carpeta de galería: ${GALLERY_DIR}`)
    exitCode = 1
  } else {
    const files = readdirSync(GALLERY_DIR)
      .filter((file) => mediaTypeOf(file) !== null)
      .sort()

    for (const file of files) {
      const type = mediaTypeOf(file)
      if (!type) continue

      const key = `gallery/${safeObjectKey(file)}`
      const existing = await prisma.galleryImage.findFirst({ where: { url: { endsWith: key } } })

      if (existing) {
        results.push({ tipo: 'galeria', nombre: file, url: existing.url, estado: 'YA EXISTE' })
        continue
      }

      const filePath = path.join(GALLERY_DIR, file)
      const { url } = await uploadObject(
        key,
        new Uint8Array(readFileSync(filePath)),
        contentTypeOf(file),
      )

      await prisma.galleryImage.create({
        data: {
          url,
          alt: type === 'VIDEO'
            ? 'Video del trabajo de High Clean SAS'
            : 'Fotografía del trabajo de High Clean SAS',
          type,
          companyId: company.id,
        },
      })
      results.push({ tipo: 'galeria', nombre: file, url, estado: 'SUBIDO' })
    }
  }

  const uploaded = results.filter((entry) => entry.estado === 'SUBIDO')
  for (const entry of uploaded) {
    const ok = await verifyUrl(entry.url)
    entry.estado = ok ? `${entry.estado} · URL OK` : `${entry.estado} · URL FALLÓ`
    if (!ok) exitCode = 1
  }

  const width = results.reduce((max, entry) => Math.max(max, entry.nombre.length), 0)
  for (const entry of results) {
    console.log(`${entry.tipo.padEnd(9)} ${entry.nombre.padEnd(width)} ${entry.url}  ${entry.estado}`)
  }

  console.log(exitCode === 0 ? 'OK: todos los archivos subidos y URLs verificadas.' : 'ERRORES: revisa las líneas marcadas.')
}

main()
  .catch((error) => {
    console.error('Fallo inesperado del script:', error)
    exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(exitCode)
  })