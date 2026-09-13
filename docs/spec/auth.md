# Auth API Specification

## Endpoints

### POST /auth/join
Register a new user and join a training room.

**Request Body:**
```json
{
  "roomCode": "TRAINING01",
  "name": "John Doe",
  "password": "securepass123"
}
```

**Validation Rules:**
- `roomCode`: string, 1-20 characters, must be a valid room code
- `name`: string, 2-50 characters
- `password`: string, 6-100 characters

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "abc123def456",
    "name": "John Doe",
    "accountId": "acc1234567890123",
    "token": "session-token-string",
    "initialBalance": 1000
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "JOIN_FAILED",
    "message": "Error description"
  }
}
```

---

### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "userId": "abc123def456",
  "password": "securepass123"
}
```

**Validation Rules:**
- `userId`: string, min 1 character
- `password`: string, min 1 character

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "abc123def456",
    "name": "John Doe",
    "token": "session-token-string"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "LOGIN_FAILED",
    "message": "Invalid credentials"
  }
}
```

---

### POST /auth/logout
Logout and invalidate session. Requires authentication.

**Headers:**
- `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
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
