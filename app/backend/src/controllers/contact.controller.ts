import type { Request, Response } from 'express'
import { contactSchema } from '../schemas/contact.schema.js'
import { registerContactMessage } from '../services/contact.service.js'
import { ValidationError } from '../utils/httpError.js'

export async function createContactHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const raw = (req.body ?? {}) as Record<string, unknown>

  const honeypot = typeof raw.website === 'string' ? raw.website.trim() : ''
  if (honeypot.length > 0) {
    res.status(201).json({ id: null, createdAt: new Date().toISOString() })
    return
  }

  const { website: _website, ...fields } = raw

  const result = contactSchema.safeParse(fields)

  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => issue.message).join(', '))
  }

  const message = await registerContactMessage(result.data)

  res.status(201).json(message)
}