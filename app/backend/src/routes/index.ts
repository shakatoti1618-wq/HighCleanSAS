import { Router } from 'express'
import adminRouter from './admin.routes.js'
import authRouter from './auth.routes.js'
import chatRouter from './chat.routes.js'
import companyRouter from './company.routes.js'
import contactRouter from './contact.routes.js'
import galleryRouter from './gallery.routes.js'
import healthRouter from './health.routes.js'
import jobsRouter from './jobs.routes.js'
import reviewRouter from './review.routes.js'
import serviceRouter from './service.routes.js'

const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/company', companyRouter)
apiRouter.use('/services', serviceRouter)
apiRouter.use('/gallery', galleryRouter)
apiRouter.use('/reviews', reviewRouter)
apiRouter.use('/contact', contactRouter)
apiRouter.use('/chat', chatRouter)
apiRouter.use('/auth', authRouter)
apiRouter.use('/jobs', jobsRouter)
apiRouter.use('/admin', adminRouter)

export default apiRouter