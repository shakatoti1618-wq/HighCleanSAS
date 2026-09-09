import { prisma } from '../lib/prisma.js'

export async function findCompany() {
  return prisma.company.findFirst()
}