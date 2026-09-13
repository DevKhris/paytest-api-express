import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"

@Entity('contacts')
export class Contact {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string

  @Column({ type: 'varchar', length: 12 })
  ownerId: string

  @Column({ type: 'varchar', length: 12 })
  contactUserId: string

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contactUserId' })
  contactUser: User
}
