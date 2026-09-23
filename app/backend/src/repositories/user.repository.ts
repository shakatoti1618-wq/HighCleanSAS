import { prisma } from '../lib/prisma.js'

export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: { select: { name: true } } },
  })
}

export async function findById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function updatePassword(id: string, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: { passwordHash },
  })
}