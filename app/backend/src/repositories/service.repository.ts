import { prisma } from '../lib/prisma.js'

export async function findServices() {
  return prisma.service.findMany({
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })
}