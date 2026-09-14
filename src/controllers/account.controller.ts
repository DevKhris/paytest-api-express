import { Request, Response } from 'express'
import { AccountService } from '../services/AccountService'

const accountService = new AccountService()

export class AccountController {
  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!
      const balance = await accountService.getBalance(userId)

      res.status(200).json({
        balance: balance.toFixed(2),
        currency: 'USD'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const status = message.toLowerCase().includes('not found') ? 404 : 400
      res.status(status).json({ error: message })
    }
  }
}
