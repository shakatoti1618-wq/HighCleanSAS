import { Router } from 'express'
import { getCompanyHandler } from '../controllers/company.controller.js'

const companyRouter = Router()

companyRouter.get('/', getCompanyHandler)

export default companyRouter