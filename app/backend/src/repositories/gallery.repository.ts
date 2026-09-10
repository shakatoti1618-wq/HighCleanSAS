import { prisma } from '../lib/prisma.js'

export async function findGalleryImages() {
  return prisma.galleryImage.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })
}