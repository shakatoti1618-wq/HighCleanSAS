import type { Request, Response } from 'express'
import { getApprovedReviews } from '../services/review.service.js'

export async function getReviewsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json(await getApprovedReviews())
}