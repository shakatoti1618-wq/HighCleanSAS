import { prisma } from '../lib/prisma.js'
import type { Prisma } from '../generated/prisma/client.js'

export async function findCompany() {
  return prisma.company.findFirst()
}

export async function updateCompany(id: string, data: Prisma.CompanyUncheckedUpdateInput) {
  return prisma.company.update({
    where: { id },
    data,
  })
}