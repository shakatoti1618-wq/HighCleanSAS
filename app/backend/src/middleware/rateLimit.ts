import { rateLimit } from 'express-rate-limit'
import { env } from '../config/env.js'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Demasiadas peticiones. Inténtalo de nuevo más tarde.',
      code: 'RATE_LIMIT',
    },
  },
})

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: {
    error: {
      message: 'Demasiadas peticiones de contacto. Espera unos minutos.',
      code: 'RATE_LIMIT',
    },
  },
})

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  message: {
    error: {
      message: 'Demasiadas peticiones de chat. Espera un momento.',
      code: 'RATE_LIMIT',
    },
  },
})