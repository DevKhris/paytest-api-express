# PayTest Backend API - Plan de Implementación

## Resumen del Proyecto
Sistema de simulación de pagos REST API diseñado exclusivamente como entorno didáctico para capacitaciones de Testing con Agentes e Herramientas de IA.

## Tecnologías
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **ORM:** TypeORM + PostgreSQL
- **Testing:** Jest + ts-jest + Supertest
- **Validación:** Zod
- **Logging:** Winston

## Arquitectura
Patrón por capas limpio:
```
Controllers → Services → Repositories → Entities
```

## Principios de Diseño
- Clean Code
- SOLID
- YAGNI
- Patrones: Repository, Factory, DTO

## Estructura de Carpetas (src/)
```
src/
├── entities/           # User, Account, Transaction, Contact, Session
├── repositories/       # Repository pattern para acceso a datos
├── services/           # Lógica de negocio
├── controllers/        # Controladores REST
├── routes/             # Definición de rutas
├── dto/                # Data Transfer Objects (validación)
├── middleware/          # Auth, logging, errors, validation
├── utils/              # Helpers (ID generator, password, logger)
├── config/             # Configuración centralizada
├── types/              # Tipos y enums compartidos
└── tests/              # Configuración y utilities de tests
```

## Fases de Implementación

| Fase | Descripción |
|------|-------------|
| 1 | Estructura Base y Entidades |
| 2 | Auth y Sala de Espera |
| 3 | Cuentas y Transacciones |
| 4 | Contactos y Sessions |
| 5 | Logging y Middleware |
| 6 | Testing y Documentación |
| 7 | Rutas y Configuración Final |

## Dependencias a Instalar
```bash
# Productivas
npm install nanoid bcrypt zod winston uuid

# Dev
npm install -D @types/bcrypt @types/uuid
```

## Configuración de Environment
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=root
DB_PASSWORD=password
DB_NAME=paytest
PORT=3000
NODE_ENV=development
```
