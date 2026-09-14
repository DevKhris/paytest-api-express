import { AppDataSource } from '../data-source'
import { RoomCode } from '../entities/RoomCode'

export class RoomCodeService {
  private get repo() {
    return AppDataSource.getRepository(RoomCode)
  }

  async isValid(code: string): Promise<boolean> {
    const roomCode = await this.repo.findOne({ where: { code } })
    return !!roomCode
  }
}
