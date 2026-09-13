import { Router, Router as ExpressRouter } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authenticateSession } from '../middleware/auth.middleware'

const router: ExpressRouter = Router()
const authController = new AuthController()

router.post('/join', authController.join.bind(authController))
router.post('/login', authController.login.bind(authController))
router.post('/logout', authenticateSession, authController.logout.bind(authController))

export default router