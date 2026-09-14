import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { SessionStatus } from "../types"
import { User } from "./User"

@Entity('sessions')
export class Session {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string

  @Column({ type: 'varchar', length: 512, unique: true })
  token: string

  @Column({ type: 'varchar', length: 12, name: 'user_id' })
  userId: string

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string

  @Column({ type: 'varchar', length: 512, nullable: true, name: 'user_agent' })
  userAgent: string

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User
}
