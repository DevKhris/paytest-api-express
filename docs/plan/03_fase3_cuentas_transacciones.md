# Fase 3: Cuentas y Transacciones

## Objetivos
- AccountService: balance dinámico calculado desde transacciones
- TransactionService: envío con idempotencia y validaciones estrictas
- Validaciones financieras prohibitivas
- Rutas `/accounts/*` y `/transactions/*`

## Archivos a Crear

### `src/services/AccountService.ts`
```typescript
class AccountService {
  async getAccount(userId: string): Promise<Account>

  async getBalance(userId: string): Promise<number>

  async createAccount(userId: string): Promise<Account>

  async accountExists(userId: string): Promise<boolean>
}
```

### `src/services/TransactionService.ts`
```typescript
class TransactionService {
  async createTransaction(
    accountId: string,
    type: TransactionType,
    amount: number,
    description: string,
    idempotencyKey: string,
    relatedUserId?: string
  ): Promise<Transaction>

  async sendBalance(
    fromUserId: string,
    toUserId: string,
    amount: number,
    idempotencyKey?: string
  ): Promise<{ transaction: Transaction; newBalance: number }>

  async getTransactionHistory(
    accountId: string,
    page?: number,
    limit?: number
  ): Promise<{ transactions: Transaction[]; total: number }>

  async getTransactionByIdempotencyKey(
    key: string
  ): Promise<Transaction | null>
}
```

### `src/dto/transaction.dto.ts`
```typescript
import { z } from 'zod'

export const SendBalanceSchema = z.object({
  toUserId: z.string().min(1),
  amount: z.number().positive()
})

export const TransactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20)
})

export type SendBalanceDTO = z.infer<typeof SendBalanceSchema>
export type TransactionQueryDTO = z.infer<typeof TransactionQuerySchema>
```

### `src/controllers/transaction.controller.ts`
```typescript
class TransactionController {
  getHistory(req: Request, res: Response): Promise<void>
  sendBalance(req: Request, res: Response): Promise<void>
}
```

### `src/controllers/account.controller.ts`
```typescript
class AccountController {
  getBalance(req: Request, res: Response): Promise<void>
}
```

### `src/routes/transaction.routes.ts`
```typescript
const router = Router()

router.get('/', authMiddleware, transactionController.getHistory.bind(transactionController))
router.post('/send', authMiddleware, transactionController.sendBalance.bind(transactionController))

export default router
```

### `src/routes/account.routes.ts`
```typescript
const router = Router()

router.get('/balance', authMiddleware, accountController.getBalance.bind(accountController))

export default router
```

## Validaciones Financieras (STRICTAS)

### Prohibido - Nunca Permitir
```typescript
function validateAmount(amount: number): void {
  if (typeof amount !== 'number' || isNaN(amount)) {
    throw new ValidationError('Amount must be a valid number')
  }
  if (!isFinite(amount)) {
    throw new ValidationError('Amount cannot be infinite')
  }
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive')
  }
}

function validateBalance(balance: number): void {
  if (balance < 0) {
    throw new BusinessError('Insufficient funds')
  }
}
```

### Validaciones en Transferencia
1. Monto > 0
2. Monto es número finito
3. No NaN
4. Balance suficiente (para SPEND)
5. Usuario destinatario existe
6. No enviarse a sí mismo

## Mecanismo de Idempotencia

### Flujo
```typescript
async function createTransaction(...) {
  const existing = await transactionRepo.findOne({ where: { idempotencyKey } })
  if (existing) {
    return existing // Retornar transacción existente
  }

  // Crear nueva transacción
  const transaction = await transactionRepo.save(newTransaction)
  return transaction
}
```

### Keys por Tipo de Transacción
| Tipo | Key Format | Ejemplo |
|------|------------|---------|
| INCOME (inicial) | `initial-{userId}` | `initial-A8LSIWVLGZ1Q` |
| SPEND | `spend-{nanoid}` | `spend-xK9mP2vL` |
| INCOME (transferencia) | `income-{nanoid}` | `income-nP8kM3jH` |

## Cálculo de Balance

### Fórmula
```typescript
function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, tx) => {
    switch (tx.type) {
      case TransactionType.INCOME:
        return balance + Number(tx.amount)
      case TransactionType.SPEND:
      case TransactionType.REQUEST:
        return balance - Number(tx.amount)
    }
  }, 0)
}
```

### Consideraciones
- Balance se calcula dinámicamente desde historial
- No se almacena como campo en Account (fuente de verdad = transacciones)
- Validar que balance final >= 0 en cada operación SPEND

## Criterios de Aceptación
- [ ] Balance se calcula correctamente desde transacciones
- [ ] Transacciones con mismo idempotencyKey no se duplican
- [ ] Transferencias verifican balance suficiente
- [ ] No permite valores negativos, NaN, o infinitos
- [ ] Historial paginado funciona correctamente
- [ ] Transacción inicial automática se crea en registro
