import { logger } from '../config/logger'

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
