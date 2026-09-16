import { prisma } from '../lib/prisma.js'

export async function findServices() {
  return prisma.service.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })
}

export async function findServiceById(id: string) {
  return prisma.service.findUnique({ where: { id } })
}

export async function createService(
  name: string,
  description: string | null,
  companyId: string,
) {
  return prisma.service.create({ data: { name, description, companyId } })
}

export async function updateService(
  id: string,
  data: { name?: string; description?: string | null },
) {
  return prisma.service.update({ where: { id }, data })
}

export async function deleteService(id: string) {
  return prisma.service.delete({ where: { id } })
}