import { prisma } from '../lib/prisma.js'

export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: { select: { name: true } } },
  })
}