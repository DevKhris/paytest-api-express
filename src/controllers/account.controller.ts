import { Request, Response } from 'express'
import { AccountService } from '../services/AccountService'

const accountService = new AccountService()

export class AccountController {
  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId!
      const balance = await accountService.getBalance(userId)

      res.status(200).json({
        success: true,
        data: { balance }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({
        success: false,
        error: {
          code: 'BALANCE_ERROR',
          message
        }
      })
    }
  }
}
