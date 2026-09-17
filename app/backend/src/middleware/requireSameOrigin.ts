import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'
import { AuthorizationError } from '../utils/httpError.js'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function parseOrigin(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function requireSameOrigin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (!MUTATING_METHODS.has(req.method)) return next()

  const originHeader = req.headers.origin
  if (!originHeader) return next()

  if (env.CORS_ORIGIN === '*') return next()

  const origin = parseOrigin(originHeader)
  if (!origin) {
    return next(new AuthorizationError('Origen de la solicitud inválido'))
  }

  const allowedOrigins = env.CORS_ORIGIN.split(',')
    .map((allowed) => allowed.trim())
    .filter((allowed) => allowed.length > 0)
    .map((allowed) => parseOrigin(allowed) ?? allowed)

  if (!allowedOrigins.includes(origin)) {
    return next(new AuthorizationError('Origen de la solicitud no permitido'))
  }

  next()
}