import type { Request, Response } from 'express'
import { chatSchema } from '../schemas/chat.schema.js'
import { getChatResponse } from '../services/chat.service.js'
import { ValidationError } from '../utils/httpError.js'

export async function createChatHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const result = chatSchema.safeParse(req.body ?? {})

  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => issue.message).join(', '),
    )
  }

  res.json({ response: await getChatResponse(result.data.message) })
}