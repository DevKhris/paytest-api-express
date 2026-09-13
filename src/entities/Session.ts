import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { SessionStatus } from "../types"
import { User } from "./User"

@Entity('sessions')
export class Session {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string

  @Column({ type: 'varchar', length: 512, unique: true })
  token: string

  @Column({ type: 'varchar', length: 12 })
  userId: string

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string

  @Column({ type: 'varchar', length: 512, nullable: true })
  userAgent: string

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: 'timestamp' })
  expiresAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User
}
