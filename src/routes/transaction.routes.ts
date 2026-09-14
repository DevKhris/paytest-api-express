import { Router, Router as ExpressRouter } from 'express'
import { TransactionController } from '../controllers/transaction.controller'
import { authenticateSession } from '../middleware/auth.middleware'

const router: ExpressRouter = Router()
const transactionController = new TransactionController()

router.get('/', authenticateSession, transactionController.getTransactions.bind(transactionController))
router.post('/transfer', authenticateSession, transactionController.transfer.bind(transactionController))

export default router
