import { AppDataSource } from '../data-source'
import { User } from '../entities/User'
import { Account } from '../entities/Account'
import { Session } from '../entities/Session'
import { Transaction } from '../entities/Transaction'
import { SessionStatus, TransactionType } from '../types'
import { generateUserId, generateToken, generateIdempotencyKey } from '../utils/idGenerator'
import { hashPassword, verifyPassword } from '../utils/password'
import { isValidRoomCode } from '../config/roomCodes'

export class AuthService {
  private userRepo = AppDataSource.getRepository(User)
  private accountRepo = AppDataSource.getRepository(Account)
  private sessionRepo = AppDataSource.getRepository(Session)
  private transactionRepo = AppDataSource.getRepository(Transaction)

  validateRoomCode(roomCode: string): boolean {
    return isValidRoomCode(roomCode)
  }

  async register(
    name: string,
    password: string,
    roomCode: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; session: Session }> {
    if (!isValidRoomCode(roomCode)) {
      throw new Error('Invalid room code')
    }

    const userId = generateUserId()
    const passwordHash = await hashPassword(password)

    const user = this.userRepo.create({
      id: userId,
      name,
      passwordHash
    })
    await this.userRepo.save(user)

    const accountId = generateToken().substring(0, 16)
    const account = this.accountRepo.create({
      id: accountId,
      userId
    })
    await this.accountRepo.save(account)

    const initialBalance = Math.floor(Math.random() * 90001) / 100 + 100

    const transaction = this.transactionRepo.create({
      id: generateToken().substring(0, 16),
      accountId,
      type: TransactionType.INCOME,
      amount: initialBalance,
      idempotencyKey: `initial-${userId}`,
      description: 'Saldo inicial de bienvenida'
    })
    await this.transactionRepo.save(transaction)

    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const session = this.sessionRepo.create({
      id: generateToken().substring(0, 36),
      token,
      userId,
      ipAddress,
      userAgent,
      status: SessionStatus.ACTIVE,
      expiresAt
    })
    await this.sessionRepo.save(session)

    return { user, session }
  }

  async login(
    userId: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; session: Session }> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new Error('User not found')
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      throw new Error('Invalid password')
    }

    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const session = this.sessionRepo.create({
      id: generateToken().substring(0, 36),
      token,
      userId,
      ipAddress,
      userAgent,
      status: SessionStatus.ACTIVE,
      expiresAt
    })
    await this.sessionRepo.save(session)

    return { user, session }
  }

  async logout(token: string): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { token } })
    if (!session) {
      throw new Error('Session not found')
    }

    session.status = SessionStatus.EXPIRED
    await this.sessionRepo.save(session)
  }

  async validateSession(token: string): Promise<Session | null> {
    const session = await this.sessionRepo.findOne({ where: { token } })
    if (!session) {
      return null
    }

    if (session.status !== SessionStatus.ACTIVE) {
      return null
    }

    if (new Date() > session.expiresAt) {
      session.status = SessionStatus.EXPIRED
      await this.sessionRepo.save(session)
      return null
    }

    return session
  }
}
