import { prisma } from '../lib/prisma.js'
import {
  findCompany,
  updateCompany,
} from '../repositories/company.repository.js'
import {
  createGalleryImage,
  deleteGalleryImage,
  findGalleryImageById,
  findGalleryImages,
} from '../repositories/gallery.repository.js'
import {
  createService,
  deleteService,
  findServiceById,
  findServices,
  updateService,
} from '../repositories/service.repository.js'
import {
  findAllContactMessages,
  deleteContactMessage,
  findContactMessageById,
  markContactMessageRead,
} from '../repositories/contact.repository.js'
import {
  findAllReviews,
  deleteReview,
  findReviewById,
  updateReviewStatus,
} from '../repositories/review.repository.js'
import {
  createJobApplication,
  deleteJobApplication,
  findAllJobApplications,
  findJobApplicationFile,
  findJobApplicationPublicById,
  updateJobApplicationStatus,
} from '../repositories/job-application.repository.js'
import type { JobFieldsInput } from '../schemas/jobs.schema.js'
import { NotFoundError, ValidationError } from '../utils/httpError.js'
import { extnameOf, mediaTypeOf, safeObjectKey, slugify } from '../utils/media.js'
import { deleteObjectIfManaged, uploadObject } from './storage.service.js'
import type { ReviewStatus } from '../generated/prisma/client.js'

export async function getDashboardStats() {
  const [services, reviews, messages, gallery, jobs] = await Promise.all([
    prisma.service.count(),
    prisma.review.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.contactMessage.groupBy({
      by: ['read'],
      _count: { _all: true },
    }),
    prisma.galleryImage.count(),
    prisma.jobApplication.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
  ])

  const reviewsByStatus = Object.fromEntries(
    reviews.map((entry) => [entry.status, entry._count._all]),
  )
  const messagesByRead = Object.fromEntries(
    messages.map((entry) => [entry.read, entry._count._all]),
  )
  const jobsByStatus = Object.fromEntries(
    jobs.map((entry) => [entry.status, entry._count._all]),
  )

  return {
    services,
    reviews: {
      total: reviews.reduce((sum, entry) => sum + entry._count._all, 0),
      pending: reviewsByStatus.PENDING ?? 0,
      approved: reviewsByStatus.APPROVED ?? 0,
      rejected: reviewsByStatus.REJECTED ?? 0,
    },
    messages: {
      total: messages.reduce((sum, entry) => sum + entry._count._all, 0),
      unread: messagesByRead.false ?? 0,
    },
    gallery,
    jobs: {
      total: jobs.reduce((sum, entry) => sum + entry._count._all, 0),
      new: jobsByStatus.NEW ?? 0,
    },
  }
}

async function requireExistingCompany() {
  const company = await findCompany()
  if (!company) {
    throw new NotFoundError('La empresa aún no está configurada')
  }
  return company
}

export async function updateCompanyData(data: Record<string, unknown>) {
  const company = await requireExistingCompany()
  return updateCompany(company.id, data)
}

export async function listServicesAdmin() {
  return findServices()
}

export async function createServiceAdmin(data: {
  name: string
  description?: string
}) {
  const company = await requireExistingCompany()
  return createService(data.name, data.description ?? null, company.id)
}

export async function updateServiceAdmin(
  id: string,
  data: { name?: string; description?: string },
) {
  const service = await findServiceById(id)
  if (!service) {
    throw new NotFoundError('Servicio no encontrado')
  }
  return updateService(id, data)
}

export type MediaFile = {
  originalName: string
  mimetype: string
  size: number
  data: Buffer
}

export async function uploadServicePhotoAdmin(id: string, file: MediaFile) {
  const service = await findServiceById(id)
  if (!service) {
    throw new NotFoundError('Servicio no encontrado')
  }

  const ext = extnameOf(file.originalName) ?? '.jpg'
  const key = `services/${slugify(service.name)}${ext}`
  const { url } = await uploadObject(
    key,
    Uint8Array.from(file.data),
    file.mimetype,
  )

  return updateService(id, { imageUrl: url })
}

export async function uploadGalleryMediaAdmin(
  file: MediaFile,
  alt: string | null,
) {
  const company = await requireExistingCompany()

  const type = mediaTypeOf(file.originalName)
  if (!type) {
    throw new ValidationError('Extensión de archivo no permitida')
  }

  const key = `gallery/${safeObjectKey(file.originalName)}`
  const { url } = await uploadObject(
    key,
    Uint8Array.from(file.data),
    file.mimetype,
  )

  return createGalleryImage(url, alt, company.id, type)
}

export async function deleteServiceAdmin(id: string) {
  const service = await findServiceById(id)
  if (!service) {
    throw new NotFoundError('Servicio no encontrado')
  }
  if (service.imageUrl) {
    await deleteObjectIfManaged(service.imageUrl)
  }
  return deleteService(id)
}

export async function listReviewsAdmin() {
  return findAllReviews()
}

export async function setReviewStatusAdmin(id: string, status: ReviewStatus) {
  const review = await findReviewById(id)
  if (!review) {
    throw new NotFoundError('Reseña no encontrada')
  }
  return updateReviewStatus(id, status)
}

export async function deleteReviewAdmin(id: string) {
  const review = await findReviewById(id)
  if (!review) {
    throw new NotFoundError('Reseña no encontrada')
  }
  return deleteReview(id)
}

export async function listMessagesAdmin() {
  return findAllContactMessages()
}

export async function markMessageReadAdmin(id: string) {
  const message = await findContactMessageById(id)
  if (!message) {
    throw new NotFoundError('Mensaje no encontrado')
  }
  return markContactMessageRead(id)
}

export async function deleteMessageAdmin(id: string) {
  const message = await findContactMessageById(id)
  if (!message) {
    throw new NotFoundError('Mensaje no encontrado')
  }
  return deleteContactMessage(id)
}

export async function listGalleryAdmin() {
  return findGalleryImages()
}

export async function addGalleryImageAdmin(data: { url: string; alt?: string }) {
  const company = await requireExistingCompany()
  return createGalleryImage(data.url, data.alt ?? null, company.id)
}

export async function deleteGalleryImageAdmin(id: string) {
  const image = await findGalleryImageById(id)
  if (!image) {
    throw new NotFoundError('Imagen no encontrada')
  }
  await deleteObjectIfManaged(image.url)
  return deleteGalleryImage(id)
}

export async function listJobsAdmin() {
  return findAllJobApplications()
}

export async function markJobReviewedAdmin(id: string) {
  const application = await findJobApplicationPublicById(id)
  if (!application) {
    throw new NotFoundError('Postulación no encontrada')
  }
  return updateJobApplicationStatus(id, { status: 'REVIEWED', read: true })
}

export async function deleteJobAdmin(id: string) {
  const application = await findJobApplicationPublicById(id)
  if (!application) {
    throw new NotFoundError('Postulación no encontrada')
  }
  return deleteJobApplication(id)
}

export async function getJobFileAdmin(id: string) {
  const application = await findJobApplicationFile(id)
  if (!application) {
    throw new NotFoundError('Postulación no encontrada')
  }
  return application
}

export async function registerJobApplication(
  input: JobFieldsInput,
  file: { originalName: string; mimeType: string; size: number; data: Buffer },
) {
  const company = await requireExistingCompany()

  const safeFileName = file.originalName.split(/[\\/]/).pop() ?? 'hoja-de-vida.pdf'

  return createJobApplication({
    name: input.name,
    position: input.position,
    email: input.email,
    phone: input.phone,
    message: input.message ?? null,
    originalFileName: safeFileName,
    mimeType: file.mimeType,
    fileSize: file.size,
    fileData: Uint8Array.from(file.data),
    dataConsentAcceptedAt: new Date(),
    companyId: company.id,
  })
}