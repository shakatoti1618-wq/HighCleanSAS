import type { NextFunction, Request, Response } from 'express'
import { AuthenticationError } from '../utils/httpError.js'

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.session.user) {
    next(new AuthenticationError('Debes iniciar sesión'))
    return
  }

  next()
}