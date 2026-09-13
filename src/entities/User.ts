import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm"
import { Account } from "./Account"

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 12, unique: true })
  id: string

  @Column({ type: 'varchar', length: 50 })
  name: string

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToOne(() => Account)
  @JoinColumn()
  account: Account
}
