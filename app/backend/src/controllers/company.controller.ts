import type { Request, Response } from 'express'
import { getCompany } from '../services/company.service.js'

export async function getCompanyHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json(await getCompany())
}