import { Router, Router as ExpressRouter } from 'express'
import { ContactController } from '../controllers/contact.controller'
import { authenticateSession } from '../middleware/auth.middleware'

const router: ExpressRouter = Router()
const contactController = new ContactController()

router.get('/', authenticateSession, contactController.list.bind(contactController))
router.post('/', authenticateSession, contactController.add.bind(contactController))
router.delete('/:contactUserId', authenticateSession, contactController.remove.bind(contactController))

export default router
