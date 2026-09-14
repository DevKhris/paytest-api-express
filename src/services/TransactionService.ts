import { AppDataSource } from '../data-source'
import { Account } from '../entities/Account'
import { Transaction } from '../entities/Transaction'
import { TransactionType } from '../types'
import { generateToken } from '../utils/idGenerator'

export class TransactionService {
  private accountRepo = AppDataSource.getRepository(Account)
  private transactionRepo = AppDataSource.getRepository(Transaction)

  private validateAmount(amount: number): void {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Amount must be a valid number')
    }
    if (!isFinite(amount)) {
      throw new Error('Amount cannot be infinite')
    }
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }
  }

  private async getBalanceForAccount(accountId: string): Promise<number> {
    const transactions = await this.transactionRepo.find({ where: { accountId } })

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

  async createTransaction(
    accountId: string,
    type: TransactionType,
    amount: number,
    description: string,
    idempotencyKey: string,
    relatedUserId?: string
  ): Promise<Transaction> {
    const existing = await this.transactionRepo.findOne({ where: { idempotencyKey } })
    if (existing) {
      return existing
    }

    this.validateAmount(amount)

    const id = generateToken().substring(0, 16)
    const transaction = this.transactionRepo.create({
      id,
      accountId,
      type,
      amount,
      idempotencyKey,
      description,
      relatedUserId
    })
    return this.transactionRepo.save(transaction)
  }

  async sendBalance(
    fromUserId: string,
    toUserId: string,
    amount: number,
    idempotencyKey?: string,
    description?: string
  ): Promise<{ transaction: Transaction; newBalance: number }> {
    if (fromUserId === toUserId) {
      throw new Error('Cannot send to yourself')
    }

    this.validateAmount(amount)

    const fromAccount = await this.accountRepo.findOne({ where: { userId: fromUserId } })
    if (!fromAccount) {
      throw new Error('Sender account not found')
    }

    const toAccount = await this.accountRepo.findOne({ where: { userId: toUserId } })
    if (!toAccount) {
      throw new Error('Receiver account not found')
    }

    const fromBalance = await this.getBalanceForAccount(fromAccount.id)
    if (fromBalance < amount) {
      throw new Error('Insufficient funds')
    }

    const spendKey = idempotencyKey || `spend-${generateToken().substring(0, 16)}`
    const incomeKey = `income-${generateToken().substring(0, 16)}`

    const spendTx = await this.createTransaction(
      fromAccount.id,
      TransactionType.SPEND,
      amount,
      description || `Transfer to ${toUserId}`,
      spendKey,
      toUserId
    )

    await this.createTransaction(
      toAccount.id,
      TransactionType.INCOME,
      amount,
      description || `Transfer from ${fromUserId}`,
      incomeKey,
      fromUserId
    )

    const newBalance = await this.getBalanceForAccount(fromAccount.id)

    return { transaction: spendTx, newBalance }
  }

  async getTransactionHistory(
    accountId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const [transactions, total] = await this.transactionRepo.findAndCount({
      where: { accountId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    })

    return { transactions, total }
  }

  async getTransactionByIdempotencyKey(key: string): Promise<Transaction | null> {
    return this.transactionRepo.findOne({ where: { idempotencyKey: key } })
  }
}
