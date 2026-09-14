import { AppDataSource } from '../data-source'
import { Session } from '../entities/Session'
import { SessionStatus } from '../types'
import { generateToken } from '../utils/idGenerator'
import { LessThan } from 'typeorm'

export class SessionService {
  private get sessionRepo() { return AppDataSource.getRepository(Session) }

  async createSession(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<Session> {
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

    return session
  }

  async validateSession(token: string): Promise<Session | null> {
    const session = await this.sessionRepo.findOne({
      where: { token, status: SessionStatus.ACTIVE }
    })

    if (!session) return null

    if (new Date() > session.expiresAt) {
      session.status = SessionStatus.EXPIRED
      await this.sessionRepo.save(session)
      return null
    }

    return session
  }

  async invalidateSession(token: string): Promise<void> {
    const session = await this.sessionRepo.findOne({ where: { token } })
    if (!session) {
      throw new Error('Session not found')
    }

    session.status = SessionStatus.EXPIRED
    await this.sessionRepo.save(session)
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.sessionRepo.find({
      where: { userId, status: SessionStatus.ACTIVE }
    })

    for (const session of sessions) {
      session.status = SessionStatus.EXPIRED
    }
    await this.sessionRepo.save(sessions)
  }

  async cleanupExpiredSessions(): Promise<number> {
    const cutoff = new Date()
    cutoff.setHours(cutoff.getHours() - 48)

    const result = await this.sessionRepo.delete({
      status: SessionStatus.EXPIRED,
      createdAt: LessThan(cutoff)
    })

    return result.affected || 0
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    return this.sessionRepo.findOne({ where: { token } })
  }
}
