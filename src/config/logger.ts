import winston from 'winston'
import dotenv from 'dotenv'

dotenv.config()

const { combine, timestamp, json, printf, colorize } = winston.format

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
        ? combine(colorize(), timestamp(), printf(({ level, message, timestamp, ...rest }) => {
            const meta = rest.meta || rest
            const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
            return `${timestamp} [${level}]: ${message}${metaStr}`
          }))
        : combine(timestamp(), json())
    })
  ]
})
