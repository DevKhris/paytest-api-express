# Accounts API Specification

## Endpoints

### GET /accounts/balance
Get account balance for the authenticated user. Requires authentication.

**Headers:**
- `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 1000.00
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "BALANCE_ERROR",
    "message": "Error description"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header"
  }
}
```
