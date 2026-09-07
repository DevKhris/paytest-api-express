# Fase 6: Base de Testing y Documentación

## Objetivos
- Configuración completa de Jest con coverage
- Archivos de setup y teardown para tests
- Scripts de package.json para testing
- Documentación de specs en `docs/spec/`

## Archivos a Crear

### `src/tests/setup.ts`
Setup global para tests:
```typescript
import { AppDataSource } from '../data-source'
import { seedRoomCodes } from '../config/roomCodes'

beforeAll(async () => {
  await AppDataSource.initialize()
})

beforeEach(async () => {
  // Limpiar tablas entre tests
  await AppDataSource.getRepository('Transaction').delete({})
  await AppDataSource.getRepository('Session').delete({})
  await AppDataSource.getRepository('Contact').delete({})
  await AppDataSource.getRepository('Account').delete({})
  await AppDataSource.getRepository('User').delete({})
})

afterAll(async () => {
  await AppDataSource.destroy()
})
```

### `src/tests/teardown.ts`
Teardown después de tests:
```typescript
afterAll(async () => {
  // Cleanup adicional si es necesario
})
```

### `jest.config.js` (actualizado)
```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/tests/**',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testTimeout: 10000,
  verbose: true
}
```

### `package.json` (scripts adicionales)
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --reporters=default --coverage",
    "lint": "eslint src/**/*.ts",
    "build": "tsc"
  }
}
```

## Documentación de Specs (docs/spec/)

### `docs/spec_auth.md`
Ver archivo spec_auth.md

### `docs/spec_accounts.md`
Ver archivo spec_accounts.md

### `docs/spec_transactions.md`
Ver archivo spec_transactions.md

### `docs/spec_contacts.md`
Ver archivo spec_contacts.md

### `docs/spec_session.md`
Ver archivo spec_session.md

## Estructura Sugerida para Tests

```
src/tests/
├── setup.ts
├── teardown.ts
├── factories/
│   ├── user.factory.ts
│   ├── account.factory.ts
│   └── transaction.factory.ts
├── helpers/
│   ├── auth.helper.ts
│   └── db.helper.ts
└── mocks/
    └── ...
```

### Ejemplo Factory (`src/tests/factories/user.factory.ts`)
```typescript
import { User } from '../../entities/User'
import { generateUserId } from '../../utils/idGenerator'
import { hashPassword } from '../../utils/password'

export async function createUser(data: Partial<User> = {}): Promise<User> {
  const userRepo = AppDataSource.getRepository(User)

  const user = userRepo.create({
    id: generateUserId(),
    name: data.name || 'Test User',
    passwordHash: data.passwordHash || await hashPassword('password123'),
    ...data
  })

  return userRepo.save(user)
}
```

## Coverage Targets
| Metric | Target |
|--------|--------|
| Statements | 70% |
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |

## Criterios de Aceptación
- [ ] `npm test` corre sin errores
- [ ] `npm run test:coverage` genera reporte
- [ ] Coverage cumple thresholds configurados
- [ ] Setup limpia DB entre tests
- [ ] Todos los specs en `docs/spec/` están completos
