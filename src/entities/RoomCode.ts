import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('room_codes')
export class RoomCode {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  code!: string

  @Column({ type: 'boolean', default: false, name: 'is_used' })
  isUsed!: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @Column({ type: 'timestamp', name: 'used_at', nullable: true })
  usedAt!: Date | null
}
