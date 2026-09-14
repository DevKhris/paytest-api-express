import { Request, Response } from 'express'
import { TransactionService } from '../services/TransactionService'
import { AccountService } from '../services/AccountService'
import { SendTransferSchema, TransactionQuerySchema } from '../dto/transaction.dto'

const transactionService = new TransactionService()
const accountService = new AccountService()

export class TransactionController {
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!
      const query = TransactionQuerySchema.safeParse(req.query)
      if (!query.success) {
        res.status(400).json({ error: 'Invalid query parameters' })
        return
      }

      const account = await accountService.getAccount(userId)
      const { page, per_page } = query.data
      const result = await transactionService.getTransactionHistory(account.id, page, per_page)

      res.status(200).json({
        transactions: result.transactions.map((tx) => ({
          id: tx.id,
          account_id: tx.accountId,
          type: tx.type,
          amount: Number(tx.amount).toFixed(2),
          idempotency_key: tx.idempotencyKey,
          related_user_id: tx.relatedUserId || null,
          description: tx.description || null,
          created_at: tx.createdAt?.toISOString() || new Date().toISOString()
        })),
        total: result.total,
        page,
        per_page
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({ error: message })
    }
  }

  async transfer(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!
      const result = SendTransferSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({ error: 'Invalid request body' })
        return
      }

      const { toUserId, amount, idempotency_key, description } = result.data

      const { transaction, newBalance } = await transactionService.sendBalance(
        userId,
        toUserId,
        amount,
        idempotency_key
      )

      res.status(200).json({
        transaction_id: transaction.id,
        amount: Number(transaction.amount).toFixed(2),
        toUserId,
        sender_balance_after: newBalance.toFixed(2),
        recipient_balance_after: '0.00',
        status: 'completed'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({ error: message })
    }
  }
}
