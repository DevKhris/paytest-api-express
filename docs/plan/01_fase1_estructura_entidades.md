# Fase 1: Estructura Base y Entidades

## Objetivos
- Crear estructura de carpetas `src/` por capas
- Crear las 5 entidades TypeORM
- Configurar data-source.ts con las entidades
- Crear tipos y enums compartidos

## Archivos a Crear

### `src/types/index.ts`
Enums y tipos compartidos:
```typescript
enum TransactionType {
  INCOME = 'INCOME',
  SPEND = 'SPEND',
  REQUEST = 'REQUEST'
}

enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED'
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}
```

### `src/entities/User.ts`
```typescript
@Entity('users')
class User {
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
```

### `src/entities/Account.ts`
```typescript
@Entity('accounts')
class Account {
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
```

### `src/entities/Transaction.ts`
```typescript
@Entity('transactions')
class Transaction {
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
```

### `src/entities/Contact.ts`
```typescript
@Entity('contacts')
class Contact {
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
```

**Nota:** `contactName` NO se almacena - se obtiene consultando `users` joined.

### `src/entities/Session.ts`
```typescript
@Entity('sessions')
class Session {
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
```

## Actualizar `src/data-source.ts`
```typescript
import { User } from './entities/User'
import { Account } from './entities/Account'
import { Transaction } from './entities/Transaction'
import { Contact } from './entities/Contact'
import { Session } from './entities/Session'

const options: DataSourceOptions = {
  // ... existente ...
  entities: [User, Account, Transaction, Contact, Session],
}
```

## Validaciones de Entidades
| Campo | Validación |
|-------|------------|
| User.id | Alfanumérico, ~12 caracteres, único |
| User.name | Min 2, max 50 caracteres |
| User.passwordHash | No vacío, bcrypt hash |
| Transaction.amount | > 0, no NaN, no Infinity |
| Transaction.idempotencyKey | Único, no vacío |
| Session.token | Min 32 caracteres, único |

## Criterios de Aceptación
- [ ] Todas las entidades creadas con decoradores TypeORM
- [ ] Relaciones OneToOne y ManyToOne correctamente definidas
- [ ] Enums para TransactionType y SessionStatus
- [ ] data-source.ts importa todas las entidades
