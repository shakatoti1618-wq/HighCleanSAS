import type { Request, Response } from 'express'
import {
  createGalleryImageSchema,
  createServiceSchema,
  reviewStatusSchema,
  updateCompanySchema,
  updateServiceSchema,
} from '../schemas/admin.schema.js'
import {
  addGalleryImageAdmin,
  createServiceAdmin,
  deleteGalleryImageAdmin,
  deleteJobAdmin,
  deleteMessageAdmin,
  deleteReviewAdmin,
  deleteServiceAdmin,
  getDashboardStats,
  getJobFileAdmin,
  listGalleryAdmin,
  listJobsAdmin,
  listMessagesAdmin,
  listReviewsAdmin,
  listServicesAdmin,
  markJobReviewedAdmin,
  markMessageReadAdmin,
  setReviewStatusAdmin,
  updateCompanyData,
  updateServiceAdmin,
} from '../services/admin.service.js'
import { ValidationError } from '../utils/httpError.js'

function parseId(req: Request): string {
  const raw = req.params.id
  const id = Array.isArray(raw) ? raw[0] : raw
  if (!id) {
    throw new ValidationError('Falta el identificador')
  }
  return id
}

export async function getDashboardHandler(_req: Request, res: Response) {
  res.json(await getDashboardStats())
}

export async function updateCompanyHandler(req: Request, res: Response) {
  const result = updateCompanySchema.safeParse(req.body ?? {})
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => issue.message).join(', '),
    )
  }
  res.json(await updateCompanyData(result.data))
}

export async function listServicesHandler(_req: Request, res: Response) {
  res.json(await listServicesAdmin())
}

export async function createServiceHandler(req: Request, res: Response) {
  const result = createServiceSchema.safeParse(req.body ?? {})
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => issue.message).join(', '),
    )
  }
  res.status(201).json(await createServiceAdmin(result.data))
}

export async function updateServiceHandler(req: Request, res: Response) {
  const result = updateServiceSchema.safeParse(req.body ?? {})
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => issue.message).join(', '),
    )
  }
  res.json(await updateServiceAdmin(parseId(req), result.data))
}

export async function deleteServiceHandler(req: Request, res: Response) {
  await deleteServiceAdmin(parseId(req))
  res.status(204).end()
}

export async function listReviewsHandler(_req: Request, res: Response) {
  res.json(await listReviewsAdmin())
}

export async function updateReviewStatusHandler(req: Request, res: Response) {
  const result = reviewStatusSchema.safeParse(req.body ?? {})
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => issue.message).join(', '),
    )
  }
  res.json(await setReviewStatusAdmin(parseId(req), result.data.status))
}

export async function deleteReviewHandler(req: Request, res: Response) {
  await deleteReviewAdmin(parseId(req))
  res.status(204).end()
}

export async function listMessagesHandler(_req: Request, res: Response) {
  res.json(await listMessagesAdmin())
}

export async function markMessageReadHandler(req: Request, res: Response) {
  res.json(await markMessageReadAdmin(parseId(req)))
}

export async function deleteMessageHandler(req: Request, res: Response) {
  await deleteMessageAdmin(parseId(req))
  res.status(204).end()
}

export async function listGalleryHandler(_req: Request, res: Response) {
  res.json(await listGalleryAdmin())
}

export async function createGalleryImageHandler(req: Request, res: Response) {
  const result = createGalleryImageSchema.safeParse(req.body ?? {})
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => issue.message).join(', '),
    )
  }
  res.status(201).json(await addGalleryImageAdmin(result.data))
}

export async function deleteGalleryImageHandler(req: Request, res: Response) {
  await deleteGalleryImageAdmin(parseId(req))
  res.status(204).end()
}

export async function listJobsHandler(_req: Request, res: Response) {
  res.json(await listJobsAdmin())
}

export async function markJobReviewedHandler(req: Request, res: Response) {
  res.json(await markJobReviewedAdmin(parseId(req)))
}

export async function deleteJobHandler(req: Request, res: Response) {
  await deleteJobAdmin(parseId(req))
  res.status(204).end()
}

export async function getJobFileHandler(req: Request, res: Response) {
  const application = await getJobFileAdmin(parseId(req))

  res.setHeader('Content-Type', application.mimeType)
  res.setHeader('Content-Disposition', `inline; filename="${application.originalFileName}"`)
  res.setHeader('Content-Length', String(application.fileSize))
  res.setHeader('Cache-Control', 'no-store')
  res.send(application.fileData)
}