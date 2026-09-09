import { Router } from 'express'
import companyRouter from './company.routes.js'
import healthRouter from './health.routes.js'

const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/company', companyRouter)

export default apiRouter