# Accounts API Specification

## Endpoints

### GET /accounts/balance

Obtener el balance actual de la cuenta del usuario autenticado.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accountId": "ACC_XK9mP2vL",
    "userId": "A8LSIWVLGZ1Q",
    "balance": 542.75,
    "currency": "USD",
    "lastUpdated": "2024-01-15T11:45:00.000Z"
  }
}
```

**Errores:**

| Código | Status | Condición |
|--------|--------|-----------|
| UNAUTHORIZED | 401 | Token inválido o expirado |
| NOT_FOUND | 404 | Cuenta no encontrada |

---

## Modelo de Datos

### Account
```typescript
{
  id: string           // Único, formato "ACC_{nanoid}"
  userId: string       // FK a User, único
  createdAt: Date
  updatedAt: Date
}
```

---

## Cálculo de Balance

El balance se calcula dinámicamente a partir del historial de transacciones:

```
balance = Σ(INCOME amounts) - Σ(SPEND amounts) - Σ(REQUEST amounts)
```

**Rules:**
- Balance inicial viene de transacción INCOME automática (100-1000)
- Balance nunca puede ser negativo
- Balance se actualiza en tiempo real con cada transacción

---

## Notas Técnicas

- La entidad Account no almacena el balance como campo
- El balance se calcula aggregando todas las transacciones de la cuenta
- Para mejor rendimiento, se puede cachear el balance y actualizarlo con cada transacción (Write-through cache)

---

## Notas

- Endpoint protegido requiere autenticación
- El balance es puramente ficticio (simulación)
- No hay conversión de moneda real
