# Transactions API Specification

## Endpoints

### GET /transactions

Obtener historial de transacciones del usuario autenticado.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|------------|------|---------|-------------|
| page | integer | 1 | Página de resultados |
| limit | integer | 20 | Resultados por página (max 100) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "TXN_P8kM3jH",
        "type": "INCOME",
        "amount": 542.75,
        "description": "Saldo inicial de bienvenida",
        "relatedUserId": null,
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "TXN_nP8kM4jH",
        "type": "SPEND",
        "amount": 50.00,
        "description": "Pago a proveedor",
        "relatedUserId": "B7MTHXWKMP2L",
        "createdAt": "2024-01-15T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

**Errores:**

| Código | Status | Condición |
|--------|--------|-----------|
| UNAUTHORIZED | 401 | Token inválido o expirado |
| VALIDATION_ERROR | 400 | Parámetros de query inválidos |

---

### POST /transactions/send

Enviar saldo a otro usuario.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Request:**
```json
{
  "toUserId": "B7MTHXWKMP2L",
  "amount": 100.00,
  "description": "Pago por servicios"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "TXN_xK9mP5vL",
      "type": "SPEND",
      "amount": 100.00,
      "description": "Pago por servicios",
      "relatedUserId": "B7MTHXWKMP2L",
      "createdAt": "2024-01-15T14:30:00.000Z"
    },
    "newBalance": 392.75
  }
}
```

**Errores:**

| Código | Status | Condición |
|--------|--------|-----------|
| UNAUTHORIZED | 401 | Token inválido o expirado |
| VALIDATION_ERROR | 400 | Datos inválidos o monto inválido |
| NOT_FOUND | 404 | Usuario destinatario no existe |
| FORBIDDEN | 403 | No puedes enviarte dinero a ti mismo |
| INSUFFICIENT_FUNDS | 400 | Balance insuficiente |
| CONFLICT | 409 | Transacción duplicada (mismo idempotency key) |

**Validaciones:**
- `toUserId`: Requerido, string, debe existir
- `amount`: Requerido, número, > 0, finito, no NaN
- `description`: Opcional, string, max 255 caracteres

---

## Modelo de Datos

### Transaction
```typescript
{
  id: string                    // Único, formato "TXN_{nanoid}", VARCHAR(16)
  accountId: string             // FK a Account, VARCHAR(16)
  type: 'INCOME' | 'SPEND' | 'REQUEST'
  amount: number               // DECIMAL(15,2)
  idempotencyKey: string        // Único, VARCHAR(64)
  description: string | null   // VARCHAR(255), opcional
  relatedUserId: string | null // VARCHAR(12), usuario relacionado
  createdAt: Date
}
```

---

## Tipos de Transacción

| Tipo | Descripción | Efecto en Balance |
|------|-------------|-------------------|
| INCOME | Ingreso/Abono | Incrementa |
| SPEND | Egreso/Gasto | Decrementa |
| REQUEST | Solicitud de pago (sin implementar) | Sin efecto aún |

---

## Validaciones Financieras Estrictas

### Validación de Monto
```typescript
if (isNaN(amount)) throw new ValidationError('Amount must be a number')
if (!isFinite(amount)) throw new ValidationError('Amount cannot be infinite')
if (amount <= 0) throw new ValidationError('Amount must be positive')
```

### Validación de Balance
```typescript
const currentBalance = await calculateBalance(accountId)
if (currentBalance < amount) {
  throw new InsufficientFundsError('Insufficient funds')
}
```

---

## Idempotencia

Cada transacción incluye una `idempotencyKey` única:

| Origen | Formato | Ejemplo |
|--------|---------|---------|
| Inicial (auto) | `initial-{userId}` | `initial-A8LSIWVLGZ1Q` |
| SPEND | `spend-{nanoid}` | `spend-xK9mP2vL` |
| INCOME (recibido) | `income-{nanoid}` | `income-nP8kM3jH` |

Si se envía una request con el mismo idempotency key, se retorna la transacción existente sin crear duplicado.

---

## Notas

- La transacción REQUEST está definida pero la lógica de aprobación/rechazo no está implementada (fuera de alcance)
- Todas las transacciones son instantáneas (sin procesamiento asíncrono)
- Los montos se almacenan con 2 decimales de precisión
