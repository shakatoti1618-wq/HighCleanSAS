import cors from 'cors'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import { env } from './config/env.js'
import { PrismaSessionStore } from './lib/sessionStore.js'
import {
  errorHandler,
  notFoundHandler,
} from './middleware/error.middleware.js'
import { generalLimiter } from './middleware/rateLimit.js'
import apiRouter from './routes/index.js'

const allowedOrigins =
  env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',')

const sessionStore = new PrismaSessionStore()

export function createApp() {
  const app = express()

  app.set('trust proxy', env.NODE_ENV === 'production' ? 1 : false)

  app.use(helmet())
  app.use(cors({ origin: allowedOrigins }))
  app.use(express.json({ limit: '100kb' }))

  app.use(
    session({
      name: 'sid',
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        httpOnly: true,
        maxAge: 12 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: 'auto',
      },
    }),
  )

  app.use('/api/v1', generalLimiter, apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}