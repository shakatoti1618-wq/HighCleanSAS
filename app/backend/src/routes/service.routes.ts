import { Router } from 'express'
import { getServicesHandler } from '../controllers/service.controller.js'

const serviceRouter = Router()

serviceRouter.get('/', getServicesHandler)

export default serviceRouter