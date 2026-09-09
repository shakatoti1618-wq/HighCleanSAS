import type { Request, Response } from 'express'
import { getHealth } from '../services/health.service.js'

export async function getHealthHandler(_req: Request, res: Response): Promise<void> {
  res.json(await getHealth())
}