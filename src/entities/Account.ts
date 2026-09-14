import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm"
import { User } from "./User"

@Entity('accounts')
export class Account {
  @PrimaryColumn({ type: 'varchar', length: 16 })
  id: string

  @Column({ type: 'varchar', length: 12, name: 'user_id' })
  userId: string

  @OneToOne(() => User, (user) => user.account)
  @JoinColumn({ name: 'user_id' })
  user: User

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
