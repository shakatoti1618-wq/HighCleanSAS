import type { Request, Response } from 'express'
import { jobFieldsSchema } from '../schemas/jobs.schema.js'
import { registerJobApplication } from '../services/admin.service.js'
import { notifyJobApplication } from '../services/notification.service.js'
import { ValidationError } from '../utils/httpError.js'

export async function applyJobHandler(req: Request, res: Response) {
  const raw = (req.body ?? {}) as Record<string, unknown>

  const honeypot = typeof raw.website === 'string' ? raw.website.trim() : ''
  if (honeypot.length > 0) {
    res.status(201).json({ id: null, createdAt: new Date().toISOString() })
    return
  }

  if (!req.file) {
    throw new ValidationError('La hoja de vida (PDF) es obligatoria')
  }

  const result = jobFieldsSchema.safeParse(raw)

  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => issue.message).join(', '),
    )
  }

  const application = await registerJobApplication(result.data, {
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    data: req.file.buffer,
  })

  void notifyJobApplication({
    name: application.name,
    position: application.position,
    email: application.email,
    phone: application.phone,
    message: application.message,
  })

  res.status(201).json({
    id: application.id,
    createdAt: application.createdAt,
    status: application.status,
  })
}