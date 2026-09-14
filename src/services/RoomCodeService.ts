import { AppDataSource } from '../data-source'
import { RoomCode } from '../entities/RoomCode'

export class RoomCodeService {
  private repo = AppDataSource.getRepository(RoomCode)

  async isValid(code: string): Promise<boolean> {
    const roomCode = await this.repo.findOne({ where: { code } })
    if (!roomCode) return false
    if (roomCode.isUsed) return false
    return true
  }

  async markAsUsed(code: string): Promise<void> {
    const roomCode = await this.repo.findOne({ where: { code } })
    if (roomCode) {
      roomCode.isUsed = true
      roomCode.usedAt = new Date()
      await this.repo.save(roomCode)
    }
  }
}
