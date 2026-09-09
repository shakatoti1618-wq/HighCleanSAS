import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/httpError.js'

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
    },
  })
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: { message: error.message, code: error.name },
    })
    return
  }

  console.error('Error no controlado:', error)
  res.status(500).json({
    error: { message: 'Error interno del servidor', code: 'INTERNAL_ERROR' },
  })
}