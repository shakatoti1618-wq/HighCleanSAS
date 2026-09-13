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