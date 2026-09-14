import jwt from 'jsonwebtoken'
import { AppDataSource } from '../data-source'
import { User } from '../entities/User'
import { Account } from '../entities/Account'
import { Session } from '../entities/Session'
import { Transaction } from '../entities/Transaction'
import { SessionStatus, TransactionType } from '../types'
import { generateUserId, generateToken, generateIdempotencyKey } from '../utils/idGenerator'
import { hashPassword, verifyPassword } from '../utils/password'
import { RoomCodeService } from './RoomCodeService'
import { config } from '../config'

const roomCodeService = new RoomCodeService()

export class AuthService {
  private get userRepo() { return AppDataSource.getRepository(User) }
  private get accountRepo() { return AppDataSource.getRepository(Account) }
  private get sessionRepo() { return AppDataSource.getRepository(Session) }
  private get transactionRepo() { return AppDataSource.getRepository(Transaction) }

  private signToken(userId: string): string {
    return jwt.sign(
      { user_id: userId },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    )
  }

  private decodeToken(token: string): { user_id: string } | null {
    try {
      return jwt.verify(token, config.jwt.secret) as { user_id: string }
    } catch {
      return null
    }
  }

  async validateRoomCode(roomCode: string): Promise<boolean> {
    return roomCodeService.isValid(roomCode)
  }

  async register(
    name: string,
    password: string,
    roomCode: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; session: Session; expiresIn: number }> {
    if (!await roomCodeService.isValid(roomCode)) {
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

    await roomCodeService.markAsUsed(roomCode)

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

    const token = this.signToken(userId)
    const expiresIn = config.jwt.expiresIn
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn)

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

    return { user, session, expiresIn }
  }

  async login(
    userId: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; session: Session; expiresIn: number }> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new Error('User not found')
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      throw new Error('Invalid password')
    }

    const token = this.signToken(userId)
    const expiresIn = config.jwt.expiresIn
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn)

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

    return { user, session, expiresIn }
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
    const decoded = this.decodeToken(token)
    if (!decoded) {
      return null
    }

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
