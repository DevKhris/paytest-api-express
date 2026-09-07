# Fase 4: Contactos y Sessions

## Objetivos
- ContactService: CRUD de contactos
- SessionService: gestión avanzada de sesiones
- Rutas `/contacts/*`
- Metadata completa de sesión

## Archivos a Crear

### `src/services/ContactService.ts`
```typescript
class ContactService {
  async addContact(
    ownerUserId: string,
    contactUserId: string
  ): Promise<{ id: string; name: string }>

  async listContacts(
    ownerUserId: string
  ): Promise<Array<{ id: string; name: string }>>

  async removeContact(
    ownerUserId: string,
    contactUserId: string
  ): Promise<void>

  async isContact(
    ownerUserId: string,
    contactUserId: string
  ): Promise<boolean>

  async getContactInfo(
    userId: string
  ): Promise<{ id: string; name: string } | null>
}
```

### `src/services/SessionService.ts`
```typescript
class SessionService {
  async createSession(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<Session>

  async validateSession(token: string): Promise<Session | null>

  async invalidateSession(token: string): Promise<void>

  async invalidateAllUserSessions(userId: string): Promise<void>

  async cleanupExpiredSessions(): Promise<number>

  async getSessionByToken(token: string): Promise<Session | null>
}
```

### `src/dto/contact.dto.ts`
```typescript
import { z } from 'zod'

export const AddContactSchema = z.object({
  userId: z.string().min(1)
})

export type AddContactDTO = z.infer<typeof AddContactSchema>
```

### `src/controllers/contact.controller.ts`
```typescript
class ContactController {
  list(req: Request, res: Response): Promise<void>
  add(req: Request, res: Response): Promise<void>
  remove(req: Request, res: Response): Promise<void>
}
```

### `src/routes/contact.routes.ts`
```typescript
const router = Router()

router.get('/', authMiddleware, contactController.list.bind(contactController))
router.post('/', authMiddleware, contactController.add.bind(contactController))
router.delete('/:contactId', authMiddleware, contactController.remove.bind(contactController))

export default router
```

## Reglas de Negocio - Contactos

### Agregar Contacto
1. Validar que `contactUserId` existe como usuario
2. No permitir agregarse a sí mismo (`ownerUserId !== contactUserId`)
3. No permitir duplicados (verificar si relación ya existe)
4. Retornar `{ id, name }` del contacto agregado

### Listar Contactos
1. Buscar todos los contactos donde `ownerId === userId`
2. Retornar solo `{ id, name }` de cada contacto
3. No incluir información sensible

### Eliminar Contacto
1. Verificar que contacto existe y pertenece al owner
2. Eliminar relación de la BD

### Validaciones
```typescript
if (ownerUserId === contactUserId) {
  throw new ValidationError('Cannot add yourself as contact')
}

const userExists = await userRepo.exists({ where: { id: contactUserId } })
if (!userExists) {
  throw new NotFoundError('User not found')
}

const alreadyExists = await contactRepo.exists({
  where: { ownerId: ownerUserId, contactUserId }
})
if (alreadyExists) {
  throw new ConflictError('Contact already exists')
}
```

## Reglas de Negocio - Sessions

### Crear Sesión
- Generar token único (64 caracteres)
- Capturar IP del cliente (`req.ip` o `req.socket.remoteAddress`)
- Capturar User-Agent (`req.headers['user-agent']`)
- Establecer expiración: 24 horas desde creación
- Status: ACTIVE

### Validar Sesión
```typescript
async validateSession(token: string): Promise<Session | null> {
  const session = await sessionRepo.findOne({
    where: { token, status: SessionStatus.ACTIVE }
  })

  if (!session) return null

  if (new Date() > session.expiresAt) {
    session.status = SessionStatus.EXPIRED
    await sessionRepo.save(session)
    return null
  }

  return session
}
```

### Cleanup de Sesiones Expiradas
```typescript
async cleanupExpiredSessions(): Promise<number> {
  const result = await sessionRepo.delete({
    status: SessionStatus.EXPIRED,
    createdAt: LessThan(addHours(new Date(), -48))
  })
  return result.affected || 0
}
```

## Metadata de Sesión Capturada
| Campo | Fuente | Ejemplo |
|-------|--------|---------|
| ipAddress | req.ip | `192.168.1.1` |
| userAgent | req.headers['user-agent'] | `Mozilla/5.0...` |
| createdAt | new Date() | `2024-01-15T10:30:00Z` |
| expiresAt | createdAt + 24h | `2024-01-16T10:30:00Z` |

## Criterios de Aceptación
- [ ] Contactos se agregan correctamente
- [ ] No permite duplicados ni auto-contactos
- [ ] Lista solo retorna `{ id, name }`
- [ ] Sesiones capturan IP y User-Agent
- [ ] Sesiones expiran correctamente
- [ ] Middleware auth valida tokens de sesión
