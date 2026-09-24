import { Router } from 'express'
import {
  createGalleryImageHandler,
  createServiceHandler,
  deleteGalleryImageHandler,
  deleteJobHandler,
  deleteMessageHandler,
  deleteReviewHandler,
  deleteServiceHandler,
  getDashboardHandler,
  getJobFileHandler,
  listGalleryHandler,
  listJobsHandler,
  listMessagesHandler,
  listReviewsHandler,
  listServicesHandler,
  markJobReviewedHandler,
  markMessageReadHandler,
  updateCompanyHandler,
  updateReviewStatusHandler,
  updateServiceHandler,
  uploadGalleryMediaHandler,
  uploadServicePhotoHandler,
} from '../controllers/admin.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import {
  noIndexHeaders,
  noStoreHeaders,
} from '../middleware/securityHeaders.js'
import { uploadGalleryMedia, uploadServicePhoto } from '../middleware/uploadMedia.js'

const adminRouter = Router()

adminRouter.use(noStoreHeaders, noIndexHeaders, requireAuth, requireAdmin)

adminRouter.get('/dashboard', getDashboardHandler)
adminRouter.patch('/company', updateCompanyHandler)

adminRouter.get('/services', listServicesHandler)
adminRouter.post('/services', createServiceHandler)
adminRouter.post('/services/:id/photo', uploadServicePhoto, uploadServicePhotoHandler)
adminRouter.patch('/services/:id', updateServiceHandler)
adminRouter.delete('/services/:id', deleteServiceHandler)

adminRouter.get('/reviews', listReviewsHandler)
adminRouter.patch('/reviews/:id', updateReviewStatusHandler)
adminRouter.delete('/reviews/:id', deleteReviewHandler)

adminRouter.get('/messages', listMessagesHandler)
adminRouter.patch('/messages/:id', markMessageReadHandler)
adminRouter.delete('/messages/:id', deleteMessageHandler)

adminRouter.get('/gallery', listGalleryHandler)
adminRouter.post('/gallery', createGalleryImageHandler)
adminRouter.post('/gallery/upload', uploadGalleryMedia, uploadGalleryMediaHandler)
adminRouter.delete('/gallery/:id', deleteGalleryImageHandler)

adminRouter.get('/jobs', listJobsHandler)
adminRouter.get('/jobs/:id/file', getJobFileHandler)
adminRouter.patch('/jobs/:id', markJobReviewedHandler)
adminRouter.delete('/jobs/:id', deleteJobHandler)

export default adminRouter