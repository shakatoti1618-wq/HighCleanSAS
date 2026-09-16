import { prisma } from '../lib/prisma.js'

export async function findGalleryImages() {
  return prisma.galleryImage.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })
}

export async function findGalleryImageById(id: string) {
  return prisma.galleryImage.findUnique({ where: { id } })
}

export async function createGalleryImage(url: string, alt: string | null, companyId: string) {
  return prisma.galleryImage.create({ data: { url, alt, companyId } })
}

export async function deleteGalleryImage(id: string) {
  return prisma.galleryImage.delete({ where: { id } })
}