# Fase 2: Autenticación y Sala de Espera

## Objetivos
- Implementar sistema de sala de espera (room codes)
- Crear utilitarios de ID y hashing
- AuthService con lógica de join, login, logout
- AuthController con rutas `/auth/*`
- Middleware de autenticación de sesión

## Dependencias a Instalar
```bash
npm install nanoid bcrypt zod
npm install -D @types/bcrypt
```

## Archivos a Crear

### `src/utils/idGenerator.ts`
Generador de IDs únicos alfanuméricos:
```typescript
import { nanoid } from 'nanoid'

const USER_ID_LENGTH = 12
const TOKEN_LENGTH = 32

export function generateUserId(): string {
  return nanoid(USER_ID_LENGTH)
}

export function generateToken(): string {
  return nanoid(TOKEN_LENGTH)
}

export function generateIdempotencyKey(prefix: string): string {
  return `${prefix}-${nanoid(16)}`
}
```

### `src/utils/password.ts`
Utilitario de hashing bcrypt:
```typescript
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### `src/config/roomCodes.ts`
Sistema de códigos de sala:
```typescript
const VALID_ROOM_CODES = ['TRAINING01', 'TRAINING02', 'DEMO001']

export function isValidRoomCode(code: string): boolean {
  return VALID_ROOM_CODES.includes(code.toUpperCase())
}

export function getValidRoomCodes(): string[] {
  return [...VALID_ROOM_CODES]
}
```

### `src/dto/auth.dto.ts`
DTOs de validación con Zod:
```typescript
import { z } from 'zod'

export const JoinRoomSchema = z.object({
  roomCode: z.string().min(1).max(20),
  name: z.string().min(2).max(50),
  password: z.string().min(6).max(100)
})

export const LoginSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(1)
})

export type JoinRoomDTO = z.infer<typeof JoinRoomSchema>
export type LoginDTO = z.infer<typeof LoginSchema>
```

### `src/services/AuthService.ts`
Servicio de autenticación:
```typescript
class AuthService {
  async join(
    roomCode: string,
    name: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; account: Account; session: Session; initialBalance: number }>

  async login(
    userId: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; session: Session }>

  async logout(token: string): Promise<void>

  async validateSession(token: string): Promise<Session | null>
}
```

### `src/middleware/auth.middleware.ts`
Middleware de autenticación:
```typescript
export function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction
): void

// Adjunta req.userId y req.sessionToken
```

### `src/controllers/auth.controller.ts`
Controlador REST:
```typescript
class AuthController {
  join(req: Request, res: Response): Promise<void>
  login(req: Request, res: Response): Promise<void>
  logout(req: Request, res: Response): Promise<void>
}
```

### `src/routes/auth.routes.ts`
Router de autenticación:
```typescript
const router = Router()

router.post('/join', authController.join.bind(authController))
router.post('/login', authController.login.bind(authController))
router.post('/logout', authMiddleware, authController.logout.bind(authController))

export default router
```

## Reglas de Negocio

### Join (Registro)
1. Validar room code contra lista de códigos válidos
2. Generar ID único para usuario
3. Hashear password con bcrypt (salt rounds: 10)
4. Crear usuario en BD
5. Crear cuenta asociada automáticamente
6. Crear transacción INCOME inicial con monto aleatorio (100-1000)
7. Crear sesión y retornar token

### Login
1. Buscar usuario por ID
2. Verificar password contra hash
3. Crear nueva sesión
4. Retornar token

### Logout
1. Invalidar sesión (cambiar status a EXPIRED)
2. No eliminar registro (auditoría)

## Transacción Inicial Automática
```typescript
{
  type: TransactionType.INCOME,
  amount: Math.floor(Math.random() * 90001) / 100 + 100, // 100.00 a 1000.00
  description: 'Saldo inicial de bienvenida',
  idempotencyKey: `initial-${userId}`
}
```

## Criterios de Aceptación
- [ ] Room codes validan correctamente
- [ ] Passwords se hashean con bcrypt
- [ ] Join crea usuario + cuenta + sesión + transacción inicial
- [ ] Login valida credenciales
- [ ] Middleware protege rutas autenticadas
- [ ] Tokens de sesión son únicos y seguros
