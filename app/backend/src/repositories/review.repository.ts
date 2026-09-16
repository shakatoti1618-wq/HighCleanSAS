import { prisma } from '../lib/prisma.js'
import type { ReviewStatus } from '../generated/prisma/client.js'

export async function findApprovedReviews() {
  return prisma.review.findMany({
    where: { status: 'APPROVED' },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}

export async function findAllReviews() {
  return prisma.review.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}

export async function findReviewById(id: string) {
  return prisma.review.findUnique({ where: { id } })
}

export async function updateReviewStatus(id: string, status: ReviewStatus) {
  return prisma.review.update({ where: { id }, data: { status } })
}

export async function deleteReview(id: string) {
  return prisma.review.delete({ where: { id } })
}