# Transactions API Specification

## Endpoints

### GET /transactions
Get transaction history for the authenticated user. Requires authentication.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): integer, positive, default: 1
- `limit` (optional): integer, positive, max 100, default: 20

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn1234567890123",
        "accountId": "acc1234567890123",
        "type": "SPEND",
        "amount": 50.00,
        "idempotencyKey": "key-abc123",
        "description": "Payment to John",
        "relatedUserId": "abc123def456",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters"
  }
}
```

---

### POST /transactions/send
Send balance to another user. Requires authentication.

**Headers:**
- `Authorization: Bearer <token>`
- `Idempotency-Key` (optional): string for idempotent requests

**Request Body:**
```json
{
  "toUserId": "abc123def456",
  "amount": 50.00
}
```

**Validation Rules:**
- `toUserId`: string, min 1 character
- `amount`: number, must be positive

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "txn1234567890123",
      "accountId": "acc1234567890123",
      "type": "SPEND",
      "amount": 50.00,
      "idempotencyKey": "key-abc123",
      "description": null,
      "relatedUserId": "abc123def456",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "newBalance": 950.00
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "TRANSFER_FAILED",
    "message": "Insufficient balance"
  }
}
```
