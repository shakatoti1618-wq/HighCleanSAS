import { Router } from 'express'
import {
  changePasswordHandler,
  loginHandler,
  logoutHandler,
  meHandler,
} from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import {
  noIndexHeaders,
  noStoreHeaders,
} from '../middleware/securityHeaders.js'

const authRouter = Router()

authRouter.post(
  '/login',
  noStoreHeaders,
  noIndexHeaders,
  authLimiter,
  loginHandler,
)

authRouter.use(noStoreHeaders, requireAuth)
authRouter.get('/me', meHandler)
authRouter.post('/logout', logoutHandler)
authRouter.patch('/password', changePasswordHandler)

export default authRouter