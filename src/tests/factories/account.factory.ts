import { AppDataSource } from '../../data-source'
import { Account } from '../../entities/Account'
import { nanoid } from 'nanoid'

export async function createAccount(data: Partial<Account> = {}): Promise<Account> {
  const accountRepo = AppDataSource.getRepository(Account)

  const account = accountRepo.create({
    id: nanoid(16),
    userId: data.userId || 'testUserId',
    ...data
  })

  return accountRepo.save(account)
}
