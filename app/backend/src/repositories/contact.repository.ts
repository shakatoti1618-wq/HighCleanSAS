import { prisma } from '../lib/prisma.js'

export async function createContactMessage(
  name: string,
  email: string,
  message: string,
  companyId: string,
) {
  return prisma.contactMessage.create({
    data: { name, email, message, companyId },
  })
}

export async function findAllContactMessages() {
  return prisma.contactMessage.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}

export async function findContactMessageById(id: string) {
  return prisma.contactMessage.findUnique({ where: { id } })
}

export async function markContactMessageRead(id: string) {
  return prisma.contactMessage.update({ where: { id }, data: { read: true } })
}

export async function deleteContactMessage(id: string) {
  return prisma.contactMessage.delete({ where: { id } })
}