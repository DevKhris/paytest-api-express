import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { TransactionType } from "../types"
import { Account } from "./Account"

@Entity('transactions')
export class Transaction {
  @PrimaryColumn({ type: 'varchar', length: 16 })
  id: string

  @Column({ type: 'varchar', length: 16 })
  accountId: string

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number

  @Column({ type: 'varchar', length: 64, unique: true })
  idempotencyKey: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string

  @Column({ type: 'varchar', length: 12, nullable: true })
  relatedUserId: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account
}
