import { prisma } from '../lib/prisma.js'

export async function findApprovedReviews() {
  return prisma.review.findMany({
    where: { status: 'APPROVED' },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}