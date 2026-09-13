import { Router } from 'express'
import { createContactHandler } from '../controllers/contact.controller.js'
import { contactLimiter } from '../middleware/rateLimit.js'

const contactRouter = Router()

contactRouter.post('/', contactLimiter, createContactHandler)

export default contactRouter