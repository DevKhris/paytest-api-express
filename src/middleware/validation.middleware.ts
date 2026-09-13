import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { BadRequestError } from './error.middleware'

export function validateBody<T extends z.ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      throw new BadRequestError('Invalid request body', result.error)
    }
    req.body = result.data
    next()
  }
}

export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      throw new BadRequestError('Invalid query params', result.error)
    }
    req.query = result.data as any
    next()
  }
}
