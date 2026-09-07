# Fase 7: Rutas y Configuración Final

## Objetivos
- Consolidar todas las rutas en router central
- Actualizar `src/index.ts` con configuración completa
- Configuración centralizada de entorno
- Scripts finales de package.json

## Archivos a Crear/Actualizar

### `src/config/index.ts`
Configuración centralizada:
```typescript
import dotenv from 'dotenv'

dotenv.config()

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'paytest'
  },

  session: {
    expirationHours: 24
  },

  transaction: {
    minInitialAmount: 100,
    maxInitialAmount: 1000
  }
}
```

### `src/routes/index.ts`
Router central:
```typescript
import { Router } from 'express'
import authRoutes from './auth.routes'
import accountRoutes from './account.routes'
import transactionRoutes from './transaction.routes'
import contactRoutes from './contact.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/accounts', accountRoutes)
router.use('/transactions', transactionRoutes)
router.use('/contacts', contactRoutes)

export default router
```

### `src/index.ts` (actualizado)
```typescript
import 'reflect-metadata'
import express, { Application, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { AppDataSource } from './data-source'
import routes from './routes'
import { errorHandler } from './middleware/error.middleware'
import { requestLogger } from './middleware/requestLogger.middleware'
import { config } from './config'
import { logger } from './config/logger'

dotenv.config()

const app: Application = express()

app.use(requestLogger)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(routes)

app.use(errorHandler)

const PORT = config.port

AppDataSource.initialize()
  .then(() => {
    logger.info('Database connected')
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    logger.error('Database connection failed', error)
    process.exit(1)
  })

export default app
```

### Actualizar `package.json`
```json
{
  "name": "paytest-api-express",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node build/index.js",
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts --ext .ts"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cookie-parser": "~1.4.4",
    "dotenv": "^16.4.5",
    "express": "~4.16.1",
    "morgan": "~1.9.1",
    "nanoid": "^3.3.7",
    "pg": "^8.11.0",
    "reflect-metadata": "^0.2.2",
    "typeorm": "^0.3.20",
    "uuid": "^9.0.0",
    "winston": "^3.11.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.7",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.19.43",
    "@types/supertest": "^6.0.2",
    "@types/uuid": "^9.0.7",
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.3"
  }
}
```

## Endpoints Finales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /health | No | Health check |
| POST | /auth/join | No | Registro en sala |
| POST | /auth/login | No | Login |
| POST | /auth/logout | Sí | Logout |
| GET | /accounts/balance | Sí | Balance actual |
| GET | /transactions | Sí | Historial paginado |
| POST | /transactions/send | Sí | Enviar saldo |
| GET | /contacts | Sí | Listar contactos |
| POST | /contacts | Sí | Agregar contacto |
| DELETE | /contacts/:id | Sí | Eliminar contacto |

## Estructura Final del Proyecto
```
paytest-api-express/
├── docs/
│   ├── spec.md              (existente)
│   ├── spec_auth.md
│   ├── spec_accounts.md
│   ├── spec_transactions.md
│   ├── spec_contacts.md
│   └── spec_session.md
├── plan/
│   ├── 00_overview.md
│   ├── 01_fase1_estructura_entidades.md
│   ├── 02_fase2_auth_sala_espera.md
│   ├── 03_fase3_cuentas_transacciones.md
│   ├── 04_fase4_contactos_sessions.md
│   ├── 05_fase5_logging_middleware.md
│   ├── 06_fase6_testing_documentacion.md
│   └── 07_fase7_rutas_config_final.md
├── src/
│   ├── entities/
│   ├── repositories/
│   ├── services/
│   ├── controllers/
│   ├── routes/
│   ├── dto/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   ├── types/
│   ├── tests/
│   ├── index.ts
│   └── data-source.ts
├── package.json
├── tsconfig.json
├── jest.config.js
└── .env.example
```

## Criterios de Aceptación
- [ ] Todas las rutas funcionan correctamente
- [ ] Health check responde en `/health`
- [ ] Middlewares se ejecutan en orden correcto
- [ ] Errores 404 para rutas no existentes
- [ ] Scripts de npm run correctamente
- [ ] Build genera JavaScript en `build/`
