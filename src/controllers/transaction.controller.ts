import { Request, Response } from 'express'
import { TransactionService } from '../services/TransactionService'
import { AccountService } from '../services/AccountService'
import { SendBalanceSchema, TransactionQuerySchema } from '../dto/transaction.dto'

const transactionService = new TransactionService()
const accountService = new AccountService()

export class TransactionController {
  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!
      const query = TransactionQuerySchema.safeParse(req.query)
      if (!query.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: query.error.flatten().fieldErrors
          }
        })
        return
      }

      const account = await accountService.getAccount(userId)
      const { page, limit } = query.data
      const result = await transactionService.getTransactionHistory(account.id, page, limit)

      res.status(200).json({
        success: true,
        data: {
          transactions: result.transactions,
          total: result.total,
          page,
          limit
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({
        success: false,
        error: {
          code: 'HISTORY_ERROR',
          message
        }
      })
    }
  }

  async sendBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!
      const result = SendBalanceSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: result.error.flatten().fieldErrors
          }
        })
        return
      }

      const { toUserId, amount } = result.data
      const idempotencyKey = req.headers['idempotency-key'] as string | undefined

      const { transaction, newBalance } = await transactionService.sendBalance(
        userId,
        toUserId,
        amount,
        idempotencyKey
      )

      res.status(200).json({
        success: true,
        data: {
          transaction,
          newBalance
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({
        success: false,
        error: {
          code: 'TRANSFER_FAILED',
          message
        }
      })
    }
  }
}
