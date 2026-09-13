import { AppDataSource } from '../../data-source'
import { User } from '../../entities/User'
import { generateUserId } from '../../utils/idGenerator'
import { hashPassword } from '../../utils/password'

export async function createUser(data: Partial<User> = {}): Promise<User> {
  const userRepo = AppDataSource.getRepository(User)

  const user = userRepo.create({
    id: generateUserId(),
    name: data.name || 'Test User',
    passwordHash: data.passwordHash || await hashPassword('password123'),
    ...data
  })

  return userRepo.save(user)
}
