import { rateLimit } from 'express-rate-limit'

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