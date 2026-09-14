import dotenv from 'dotenv'

dotenv.config()

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),

  db: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'paytest'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'jwt-secret-key-change-in-prod',
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '86400', 10)
  },

  session: {
    expirationHours: 24
  },

  transaction: {
    minInitialAmount: 100,
    maxInitialAmount: 1000
  }
}
