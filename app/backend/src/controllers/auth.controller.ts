import type { Request, Response } from 'express'
import {
  changePasswordSchema,
  loginSchema,
} from '../schemas/auth.schema.js'
import {
  changePassword,
  verifyCredentials,
} from '../services/auth.service.js'
import {
  AuthenticationError,
  ValidationError,
} from '../utils/httpError.js'

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

  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) reject(error)
      else resolve()
    })
  })

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

export async function changePasswordHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const result = changePasswordSchema.safeParse(req.body ?? {})

  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => issue.message).join(', '),
    )
  }

  const userId = req.session.user?.id

  if (!userId) {
    throw new AuthenticationError('Debes iniciar sesión')
  }

  await changePassword(
    userId,
    result.data.currentPassword,
    result.data.newPassword,
  )

  await new Promise<void>((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) reject(error)
      else resolve()
    })
  })

  res.clearCookie(SESSION_COOKIE_NAME)
  res.json({
    message: 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.',
  })
}

export async function meHandler(
  req: Request,
  res: Response,
): Promise<void> {
  res.json({ user: req.session.user ?? null })
}