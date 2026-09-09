import type { Request, Response } from 'express'
import { getHealth } from '../services/health.service.js'

export function getHealthHandler(_req: Request, res: Response): void {
  res.json(getHealth())
}