import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import {
  errorHandler,
  notFoundHandler,
} from './middleware/error.middleware.js'
import { generalLimiter } from './middleware/rateLimit.js'
import apiRouter from './routes/index.js'

const allowedOrigins =
  env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',')

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: allowedOrigins }))
  app.use(express.json({ limit: '100kb' }))

  app.use('/api/v1', generalLimiter, apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}