import { prisma } from '../lib/prisma.js'
import type { JobApplicationStatus } from '../generated/prisma/client.js'

const publicFields = {
  id: true,
  name: true,
  position: true,
  email: true,
  phone: true,
  message: true,
  status: true,
  read: true,
  originalFileName: true,
  mimeType: true,
  fileSize: true,
  dataConsentAcceptedAt: true,
  createdAt: true,
} as const

export async function createJobApplication(data: {
  name: string
  position: string
  email: string
  phone: string
  message: string | null
  originalFileName: string
  mimeType: string
  fileSize: number
  fileData: Uint8Array<ArrayBuffer>
  dataConsentAcceptedAt: Date
  companyId: string
  status?: JobApplicationStatus
}) {
  return prisma.jobApplication.create({ data })
}

export async function findAllJobApplications() {
  return prisma.jobApplication.findMany({
    select: publicFields,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}

export async function findJobApplicationPublicById(id: string) {
  return prisma.jobApplication.findUnique({
    where: { id },
    select: publicFields,
  })
}

export async function findJobApplicationFile(id: string) {
  return prisma.jobApplication.findUnique({
    where: { id },
    select: {
      id: true,
      originalFileName: true,
      mimeType: true,
      fileSize: true,
      fileData: true,
    },
  })
}

export async function updateJobApplicationStatus(
  id: string,
  data: { status?: JobApplicationStatus; read?: boolean },
) {
  return prisma.jobApplication.update({
    where: { id },
    data,
    select: publicFields,
  })
}

export async function deleteJobApplication(id: string) {
  return prisma.jobApplication.delete({ where: { id } })
}