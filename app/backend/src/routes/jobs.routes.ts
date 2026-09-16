import { Router } from 'express'
import { applyJobHandler } from '../controllers/jobs.controller.js'
import { jobsLimiter } from '../middleware/rateLimit.js'
import { uploadResume } from '../middleware/upload.js'

const jobsRouter = Router()

jobsRouter.post('/apply', jobsLimiter, uploadResume, applyJobHandler)

export default jobsRouter