import { prisma } from '../../src/lib/prisma.js'

const VIDEO_EXTENSION = /\.(mp4|webm|mov)$/i

async function main() {
  const videos = await prisma.galleryImage.findMany()

  let updated = 0
  for (const item of videos) {
    const isVideo = VIDEO_EXTENSION.test(item.url)
    if (isVideo && item.type !== 'VIDEO') {
      await prisma.galleryImage.update({
        where: { id: item.id },
        data: { type: 'VIDEO' },
      })
      updated += 1
      console.log(`  - ${item.url} → type VIDEO (era ${item.type})`)
    } else if (!isVideo && item.type === 'VIDEO') {
      await prisma.galleryImage.update({
        where: { id: item.id },
        data: { type: 'IMAGE' },
      })
      updated += 1
      console.log(`  - ${item.url} → type IMAGE (era ${item.type})`)
    }
  }

  if (updated === 0) {
    console.log('Sin cambios: ningún registro de galería con tipo incorrecto.')
  } else {
    console.log(`Galería corregida: ${updated} registro(s) actualizado(s).`)
  }

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})