import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"

@Entity('contacts')
export class Contact {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string

  @Column({ type: 'varchar', length: 12, name: 'owner_id' })
  ownerId: string

  @Column({ type: 'varchar', length: 12, name: 'contact_user_id' })
  contactUserId: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contact_user_id' })
  contactUser: User
}
