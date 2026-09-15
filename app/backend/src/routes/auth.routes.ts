import { Router } from 'express'
import {
  loginHandler,
  logoutHandler,
  meHandler,
} from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { authLimiter } from '../middleware/rateLimit.js'

const authRouter = Router()

authRouter.post('/login', authLimiter, loginHandler)

authRouter.use(requireAuth)
authRouter.get('/me', meHandler)
authRouter.post('/logout', logoutHandler)

export default authRouter