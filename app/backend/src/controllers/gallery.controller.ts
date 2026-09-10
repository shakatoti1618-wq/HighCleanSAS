import type { Request, Response } from 'express'
import { getGalleryImages } from '../services/gallery.service.js'

export async function getGalleryImagesHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json(await getGalleryImages())
}