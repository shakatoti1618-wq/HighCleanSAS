import { Router } from 'express'
import { createChatHandler } from '../controllers/chat.controller.js'
import { chatLimiter } from '../middleware/rateLimit.js'

const chatRouter = Router()

chatRouter.post('/', chatLimiter, createChatHandler)

export default chatRouter