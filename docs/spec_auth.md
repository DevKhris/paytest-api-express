# Auth API Specification

## Endpoints

### POST /auth/join

Unirse a una sala de entrenamiento y crear una cuenta de usuario.

**Request:**
```json
{
  "roomCode": "TRAINING01",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "A8LSIWVLGZ1Q",
      "name": "John Doe",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "account": {
      "id": "ACC_XK9mP2vL",
      "userId": "A8LSIWVLGZ1Q",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "initialBalance": 542.75
  }
}
```

**Errores:**

| Código | Status | Condición |
|--------|--------|-----------|
| VALIDATION_ERROR | 400 | Datos inválidos o incompletos |
| INVALID_ROOM_CODE | 400 | Room code no válido |
| USER_EXISTS | 409 | Nombre de usuario ya existe |

**Validaciones:**
- `roomCode`: Requerido, string, debe existir en lista de salas válidas
- `name`: Requerido, string, min 2, max 50 caracteres
- `password`: Requerido, string, min 6, max 100 caracteres

**Efectos secundarios:**
1. Crea usuario con ID único generado
2. Crea cuenta vinculada al usuario
3. Crea transacción inicial INCOME con monto aleatorio (100-1000)
4. Crea sesión activa

---

### POST /auth/login

Iniciar sesión con credenciales de usuario.

**Request:**
```json
{
  "userId": "A8LSIWVLGZ1Q",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "A8LSIWVLGZ1Q",
      "name": "John Doe",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores:**

| Código | Status | Condición |
|--------|--------|-----------|
| VALIDATION_ERROR | 400 | Datos inválidos |
| UNAUTHORIZED | 401 | Usuario no existe o password incorrecto |

**Validaciones:**
- `userId`: Requerido, string, debe existir en sistema
- `password`: Requerido, string, debe coincidir con hash almacenado

**Efectos secundarios:**
1. Crea nueva sesión con metadata (IP, User-Agent)
2. Invalidar sesiones anteriores del usuario (opcional)

---

### POST /auth/logout

Cerrar sesión actual.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Session closed successfully"
  }
}
```

**Errores:**

| Código | Status | Condición |
|--------|--------|-----------|
| UNAUTHORIZED | 401 | Token no proporcionado o inválido |

**Efectos secundarios:**
1. Marca sesión como EXPIRED en BD
2. No elimina registro (auditoría)

---

## Códigos de Sala Válidos

| Código | Descripción |
|--------|-------------|
| TRAINING01 | Sala de entrenamiento 1 |
| TRAINING02 | Sala de entrenamiento 2 |
| DEMO001 | Sala de demostración |

---

## Modelo de Datos

### User
```typescript
{
  id: string           // Alfanumérico, ~12 caracteres, único
  name: string         // 2-50 caracteres
  passwordHash: string // Hash bcrypt
  createdAt: Date
  updatedAt: Date
}
```

### Session
```typescript
{
  id: string           // Único
  token: string        // 32+ caracteres, único
  userId: string       // FK a User
  ipAddress: string    // IP del cliente
  userAgent: string    // User-Agent del cliente
  status: 'ACTIVE' | 'EXPIRED'
  expiresAt: Date      // createdAt + 24 horas
  createdAt: Date
}
```

---

## Notes

- Contraseñas se hashean con bcrypt (salt rounds: 10)
- Tokens de sesión expiran en 24 horas
- Todas las respuestas de autenticación incluyen el `sessionToken` que debe usarse en headers `Authorization: Bearer <token>` para requests protegidos
