import type { RequestHandler } from 'express'

export const noStoreHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
}

export const noIndexHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  next()
}