# Contacts API Specification

## Endpoints

### GET /contacts

Listar todos los contactos del usuario autenticado.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "B7MTHXWKMP2L",
        "name": "Jane Smith"
      },
      {
        "id": "C9KLVNQMPR4J",
        "name": "Bob Johnson"
      }
    ],
    "count": 2
  }
}
```

**Errores:**

| Código | Status | Condición |
|--------|--------|-----------|
| UNAUTHORIZED | 401 | Token inválido o expirado |

---

### POST /contacts

Agregar un usuario a la lista de contactos.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Request:**
```json
{
  "userId": "B7MTHXWKMP2L"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "B7MTHXWKMP2L",
      "name": "Jane Smith"
    }
  }
}
```

**Errores:**

| Código | Status | Condición |
|--------|--------|-----------|
| UNAUTHORIZED | 401 | Token inválido o expirado |
| VALIDATION_ERROR | 400 | userId no proporcionado |
| NOT_FOUND | 404 | Usuario a agregar no existe |
| FORBIDDEN | 403 | No puedes agregarte a ti mismo |
| CONFLICT | 409 | Contacto ya existe |

**Validaciones:**
- `userId`: Requerido, string, debe existir en sistema
- No puede ser el mismo usuario autenticado
- No puede ser un contacto ya existente

---

### DELETE /contacts/:contactId

Eliminar un contacto de la lista.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Contact removed successfully"
  }
}
```

**Errores:**

| Código | Status | Condición |
|--------|--------|-----------|
| UNAUTHORIZED | 401 | Token inválido o expirado |
| NOT_FOUND | 404 | Contacto no encontrado o no pertenece al usuario |

---

## Modelo de Datos

### Contact
```typescript
{
  id: string           // VARCHAR(36), UUID
  ownerId: string      // FK a User, VARCHAR(12)
  contactUserId: string // FK a User, VARCHAR(12)
  createdAt: Date
}
```

**Constraint:** `UNIQUE unique_contact (ownerId, contactUserId)`

**Nota:** El `name` del contacto se obtiene consultando `users` con join, NO se almacena en contacts.

---

## Reglas de Negocio

### Agregar Contacto
1. Verificar que `contactUserId` existe como usuario
2. Verificar que `ownerId !== contactUserId` (no auto-contacto)
3. Verificar que no exista duplicado (ownerId + contactUserId únicos)
4. Crear relación en BD

### Listar Contactos
1. Buscar todos los contactos donde `ownerId === userId`
2. Retornar solo `id` y `name` de cada contacto (no información sensible)

### Eliminar Contacto
1. Verificar que contacto existe
2. Verificar que pertenece al usuario autenticado
3. Eliminar relación

---

## Notas

- Los contactos son unidireccionales (A agrega a B, no implica que B agregó a A)
- No hay límite en la cantidad de contactos
- La información retornada es mínima por privacidad (solo id y nombre)
