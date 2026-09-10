import { Router } from 'express'
import companyRouter from './company.routes.js'
import galleryRouter from './gallery.routes.js'
import healthRouter from './health.routes.js'
import serviceRouter from './service.routes.js'

const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/company', companyRouter)
apiRouter.use('/services', serviceRouter)
apiRouter.use('/gallery', galleryRouter)

export default apiRouter