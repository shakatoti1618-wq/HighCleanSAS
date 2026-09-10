import { Router } from 'express'
import { getGalleryImagesHandler } from '../controllers/gallery.controller.js'

const galleryRouter = Router()

galleryRouter.get('/', getGalleryImagesHandler)

export default galleryRouter