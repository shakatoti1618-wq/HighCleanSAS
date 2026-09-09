import { Router } from 'express'
import { getHealthHandler } from '../controllers/health.controller.js'

const healthRouter = Router()

healthRouter.get('/', getHealthHandler)

export default healthRouter