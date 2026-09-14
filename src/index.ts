import 'reflect-metadata'
import express, { Application, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import cors from 'cors'
import { AppDataSource } from './data-source'
import routes from './routes'
import { errorHandler } from './middleware/error.middleware'
import { requestLogger } from './middleware/requestLogger.middleware'
import { config } from './config'
import { logger as appLogger } from './config/logger'

const app: Application = express()

app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3001').split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}))
app.use(requestLogger)
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(routes)

app.use(errorHandler)

const PORT = config.port

AppDataSource.initialize()
  .then(() => {
    appLogger.info('Database connected')
    app.listen(PORT, () => {
      appLogger.info(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    appLogger.error('Database connection failed', error)
    process.exit(1)
  })

export default app
