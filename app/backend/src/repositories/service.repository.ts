import { prisma } from '../lib/prisma.js'
import type { Prisma } from '../generated/prisma/client.js'

const optionsInclude = {
  include: {
    options: {
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    },
  },
} satisfies Prisma.ServiceFindManyArgs

export async function findServices() {
  return prisma.service.findMany({
    ...optionsInclude,
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })
}

export async function findServiceById(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      options: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      },
    },
  })
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
  data: { name?: string; description?: string | null; imageUrl?: string | null },
) {
  return prisma.service.update({ where: { id }, data })
}

export async function deleteService(id: string) {
  return prisma.service.delete({ where: { id } })
}

export async function replaceServiceOptions(
  serviceId: string,
  options: {
    label: string
    price: number
    note?: string | null
    group?: string | null
    sortOrder: number
  }[],
) {
  return prisma.$transaction(async (tx) => {
    await tx.serviceOption.deleteMany({ where: { serviceId } })
    await tx.serviceOption.createMany({
      data: options.map((option) => ({ ...option, serviceId })),
    })
    return tx.service.findUnique({
      where: { id: serviceId },
      include: {
        options: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    })
  })
}