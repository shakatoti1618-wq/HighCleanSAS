import type { NextFunction, Request, Response } from 'express'
import { AuthorizationError } from '../utils/httpError.js'

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.session.user?.role !== 'admin') {
    next(new AuthorizationError('Requieres permisos de administrador'))
    return
  }

  next()
}