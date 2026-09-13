import { Router } from 'express'
import { getReviewsHandler } from '../controllers/review.controller.js'

const reviewRouter = Router()

reviewRouter.get('/', getReviewsHandler)

export default reviewRouter