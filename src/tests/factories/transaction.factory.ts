import { AppDataSource } from '../../data-source'
import { Transaction } from '../../entities/Transaction'
import { TransactionType } from '../../types'
import { generateIdempotencyKey } from '../../utils/idGenerator'
import { nanoid } from 'nanoid'

export async function createTransaction(data: Partial<Transaction> = {}): Promise<Transaction> {
  const transactionRepo = AppDataSource.getRepository(Transaction)

  const transaction = transactionRepo.create({
    id: nanoid(16),
    accountId: data.accountId || 'testAccountId',
    type: data.type || TransactionType.SPEND,
    amount: data.amount || 10.0,
    idempotencyKey: data.idempotencyKey || generateIdempotencyKey('test'),
    description: data.description || 'Test transaction',
    relatedUserId: data.relatedUserId || null,
    ...data
  })

  return transactionRepo.save(transaction)
}
