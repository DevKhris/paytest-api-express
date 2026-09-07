# Session API Specification

## Descripción

El sistema de sesiones maneja la autenticación y autorización de usuarios. Cada sesión incluye metadata de rastreo para seguridad y auditoría.

## Modelo de Datos

### Session
```typescript
{
  id: string              // Único
  token: string           // 32+ caracteres, único (JWT o nanoid)
  userId: string          // FK a User
  ipAddress: string        // IP del cliente (IPv4/IPv6)
  userAgent: string        // User-Agent del navegador/cliente
  status: 'ACTIVE' | 'EXPIRED'
  expiresAt: Date          // createdAt + 24 horas
  createdAt: Date
}
```

---

## Ciclo de Vida

### Creación
1. Usuario se autentica (login o join)
2. Se genera token único
3. Se captura IP del request (`req.ip` o `req.socket.remoteAddress`)
4. Se captura User-Agent (`req.headers['user-agent']`)
5. Se establece expiración (24 horas)
6. Se guarda en BD con status ACTIVE

### Validación
1. Extraer token del header `Authorization: Bearer <token>`
2. Buscar sesión por token
3. Verificar que status === ACTIVE
4. Verificar que expiresAt > now
5. Si expiro, marcar como EXPIRED y retornar null

### Invalidación
1. Marcar status como EXPIRED (no eliminar para auditoría)
2. Opcional: invalidar todas las sesiones del usuario

---

## Validación de Token

El middleware de autenticación valida cada request protegido:

```typescript
async function validateSession(token: string): Promise<Session | null> {
  const session = await sessionRepo.findOne({
    where: { token, status: 'ACTIVE' }
  })

  if (!session) return null

  if (new Date() > session.expiresAt) {
    session.status = 'EXPIRED'
    await sessionRepo.save(session)
    return null
  }

  return session
}
```

---

## Header de Autorización

```
Authorization: Bearer <sessionToken>
```

| Parte | Descripción |
|-------|-------------|
| Bearer | Tipo de token (fijo) |
| sessionToken | Token de sesión generado |

**Ejemplo:**
```
Authorization: Bearer xK9mP2vL-nP8kM3jH-nM4lQ7rT6s
```

---

## Errores de Sesión

| Código | Status | Condición |
|--------|--------|-----------|
| UNAUTHORIZED | 401 | Token no proporcionado |
| UNAUTHORIZED | 401 | Token no existe |
| UNAUTHORIZED | 401 | Token expirado |

**Response de error típico:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Session expired or invalid"
  }
}
```

---

## Metadata de Sesión

### IP Address
```typescript
// Fuentes (en orden de prioridad)
req.ip                    // Proxy forwarded IP
req.socket.remoteAddress  // Direct socket IP
req.connection.remoteAddress // Legacy
```

### User-Agent
```typescript
req.headers['user-agent']
```

**Ejemplo:**
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36
```

---

## Cleanup de Sesiones

Sesiones expiradas se limpian después de 48 horas de expiración:

```typescript
await sessionRepo.delete({
  status: 'EXPIRED',
  createdAt: LessThan(addHours(new Date(), -48))
})
```

---

## Límites

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Duración | 24 horas | Tiempo hasta expiración |
| Token length | 32+ chars | Longitud mínima del token |
| Cleanup | 48 horas | Tiempo antes de borrar sesiones expiradas |

---

## Notas

- Tokens son stateless (se validan contra BD)
- No hay refresh token (nuevo login requiere re-autenticación)
- Sesiones no se renuevan automáticamente al usarse
- Invalidar todas las sesiones es útil al cambiar contraseña
