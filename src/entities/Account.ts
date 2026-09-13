import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm"
import { User } from "./User"

@Entity('accounts')
export class Account {
  @PrimaryColumn({ type: 'varchar', length: 16 })
  id: string

  @Column({ type: 'varchar', length: 12 })
  userId: string

  @OneToOne(() => User, (user) => user.account)
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
