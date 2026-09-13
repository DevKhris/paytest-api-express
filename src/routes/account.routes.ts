import { Router, Router as ExpressRouter } from 'express'
import { AccountController } from '../controllers/account.controller'
import { authenticateSession } from '../middleware/auth.middleware'

const router: ExpressRouter = Router()
const accountController = new AccountController()

router.get('/balance', authenticateSession, accountController.getBalance.bind(accountController))

export default router
