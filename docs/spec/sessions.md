# Sessions API Specification

Sessions are managed through the Auth endpoints. There is no dedicated session management endpoint.

## Session Lifecycle

### Creation
Sessions are created when a user:
1. Joins a room via `POST /auth/join`
2. Logs in via `POST /auth/login`

### Termination
Sessions are terminated when a user:
1. Logs out via `POST /auth/logout`

## Authentication
All authenticated endpoints require the `Authorization` header:
```
Authorization: Bearer <session-token>
```

## Session Properties
- **token**: Unique session identifier (32 characters)
- **userId**: Associated user ID
- **ipAddress**: Client IP address
- **userAgent**: Client user agent string
- **status**: Session status (`ACTIVE` or `EXPIRED`)
- **expiresAt**: Session expiration timestamp
- **createdAt**: Session creation timestamp

## Error Responses

### Missing/Invalid Token (401)
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header"
  }
}
```

### Invalid/Expired Session (401)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_SESSION",
    "message": "Session is invalid or expired"
  }
}
```
