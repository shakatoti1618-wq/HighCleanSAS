import type { Request, Response } from 'express'
import { getServices } from '../services/service.service.js'

export async function getServicesHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json(await getServices())
}