# Fase 5: Logging y Middleware

## Objetivos
- Sistema de logging estructurado con Winston
- Middleware de manejo de errores global
- Middleware de validación de requests
- Middleware de request logging/tracking

## Archivos a Crear

### `src/config/logger.ts`
Configuración de Winston:
```typescript
import winston from 'winston'
import dotenv from 'dotenv'

dotenv.config()

const { combine, timestamp, json, printf, colorize } = winston.format

const logFormat = printf(({ level, message, timestamp, context }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    context
  })
})

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    json()
  ),
  defaultMeta: { service: 'paytest-api' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? combine(colorize(), timestamp(), printf(({ level, message, timestamp, context }) => {
            return `${timestamp} [${level}]: ${message} ${JSON.stringify(context)}`
          }))
        : combine(timestamp(), json())
    })
  ]
})
```

### `src/middleware/error.middleware.ts`
Manejo global de errores:
```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

class BadRequestError extends AppError { /* 400 */ }
class UnauthorizedError extends AppError { /* 401 */ }
class ForbiddenError extends AppError { /* 403 */ }
class NotFoundError extends AppError { /* 404 */ }
class ConflictError extends AppError { /* 409 */ }

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): (req: Request, res: Response, next: NextFunction) => void
```

### `src/middleware/validation.middleware.ts`
Middleware de validación con Zod:
```typescript
import { z } from 'zod'

export function validateBody<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      throw new BadRequestError('VALIDATION_ERROR', 'Invalid request body', result.error)
    }
    req.body = result.data
    next()
  }
}

export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      throw new BadRequestError('VALIDATION_ERROR', 'Invalid query params', result.error)
    }
    req.query = result.data as any
    next()
  }
}
```

### `src/middleware/requestLogger.middleware.ts`
Logging de requests entrantes:
```typescript
import { v4 as uuidv4 } from 'uuid'

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4()
  req.correlationId = correlationId

  const startTime = Date.now()

  logger.info('Incoming request', {
    correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  })

  res.on('finish', () => {
    const duration = Date.now() - startTime
    logger.info('Request completed', {
      correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    })
  })

  next()
}
```

### `src/utils/logger.ts`
Helpers de logging:
```typescript
export function logInfo(message: string, context?: Record<string, unknown>): void {
  logger.info(message, context)
}

export function logError(
  message: string,
  error?: Error,
  context?: Record<string, unknown>
): void {
  logger.error(message, { error: error?.message, stack: error?.stack, ...context })
}

export function logDebug(message: string, context?: Record<string, unknown>): void {
  logger.debug(message, context)
}
```

## Estructura de Log
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Incoming request",
  "context": {
    "service": "paytest-api",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000",
    "method": "POST",
    "url": "/auth/login",
    "ip": "192.168.1.1"
  }
}
```

## Códigos de Error
| Código | HTTP Status | Descripción |
|--------|-------------|-------------|
| VALIDATION_ERROR | 400 | Datos de entrada inválidos |
| UNAUTHORIZED | 401 | No autenticado |
| FORBIDDEN | 403 | No autorizado |
| NOT_FOUND | 404 | Recurso no encontrado |
| CONFLICT | 409 | Conflicto (duplicado, etc.) |
| INSUFFICIENT_FUNDS | 400 | Balance insuficiente |
| INTERNAL_ERROR | 500 | Error interno del servidor |

## Tipos de Middleware a Registrar
```typescript
// src/index.ts
app.use(requestLogger)           // Logging de requests
app.use(cookieParser())          // Cookies
app.use(express.json())          // Body parsing
app.use(authenticateSession)     // Auth (en rutas protegidas)
app.use('/auth', authRoutes)     // Rutas auth (abiertas)
app.use('/accounts', accountRoutes)  // Rutas accounts (protegidas)
app.use('/transactions', transactionRoutes) // Rutas transactions (protegidas)
app.use('/contacts', contactRoutes)     // Rutas contacts (protegidas)
app.use(errorHandler)            // Manejo global de errores
```

## Criterios de Aceptación
- [ ] Logs son JSON estructurados en producción
- [ ] Errors incluyen stack trace en desarrollo
- [ ] Correlation ID se genera y propaga
- [ ] Todos los errores retornan formato consistente
- [ ] Requests incompletos son rechazados con 400
- [ ] Zod valida DTOs antes de llegar al controller
