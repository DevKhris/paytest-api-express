import { AppDataSource } from '../data-source'
import { Account } from '../entities/Account'
import { Transaction } from '../entities/Transaction'
import { TransactionType } from '../types'

export class AccountService {
  private accountRepo = AppDataSource.getRepository(Account)
  private transactionRepo = AppDataSource.getRepository(Transaction)

  async getAccount(userId: string): Promise<Account> {
    const account = await this.accountRepo.findOne({ where: { userId } })
    if (!account) {
      throw new Error('Account not found')
    }
    return account
  }

  async getBalance(userId: string): Promise<number> {
    const account = await this.getAccount(userId)
    const transactions = await this.transactionRepo.find({ where: { accountId: account.id } })

    return transactions.reduce((balance, tx) => {
      switch (tx.type) {
        case TransactionType.INCOME:
          return balance + Number(tx.amount)
        case TransactionType.SPEND:
        case TransactionType.REQUEST:
          return balance - Number(tx.amount)
        default:
          return balance
      }
    }, 0)
  }

  async createAccount(userId: string): Promise<Account> {
    const account = this.accountRepo.create({ userId })
    return this.accountRepo.save(account)
  }

  async accountExists(userId: string): Promise<boolean> {
    const count = await this.accountRepo.count({ where: { userId } })
    return count > 0
  }
}
