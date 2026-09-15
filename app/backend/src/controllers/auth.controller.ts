import type { Request, Response } from 'express'
import { loginSchema } from '../schemas/auth.schema.js'
import { verifyCredentials } from '../services/auth.service.js'
import { ValidationError } from '../utils/httpError.js'

const SESSION_COOKIE_NAME = 'sid'

export async function loginHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const result = loginSchema.safeParse(req.body ?? {})

  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => issue.message).join(', '),
    )
  }

  const user = await verifyCredentials(result.data.email, result.data.password)

  req.session.user = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  res.json({ user: req.session.user })
}

export async function logoutHandler(
  req: Request,
  res: Response,
): Promise<void> {
  req.session.destroy(() => {
    res.clearCookie(SESSION_COOKIE_NAME)
    res.status(204).send()
  })
}

export async function meHandler(
  req: Request,
  res: Response,
): Promise<void> {
  res.json({ user: req.session.user ?? null })
}