import { Router, Router as ExpressRouter } from 'express'
import authRoutes from './auth.routes'
import accountRoutes from './account.routes'
import transactionRoutes from './transaction.routes'
import contactRoutes from './contact.routes'

const router: ExpressRouter = Router()

router.use('/auth', authRoutes)
router.use('/accounts', accountRoutes)
router.use('/transactions', transactionRoutes)
router.use('/contacts', contactRoutes)

export default router
