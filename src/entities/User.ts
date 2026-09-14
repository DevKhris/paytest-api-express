import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm"
import { Account } from "./Account"

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  id: string

  @Column({ type: 'varchar', length: 50 })
  name: string

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @OneToOne(() => Account)
  @JoinColumn()
  account: Account
}
