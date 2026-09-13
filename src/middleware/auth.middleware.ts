import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/AuthService'

const authService = new AuthService()

declare global {
  namespace Express {
    interface Request {
      userId?: string
      sessionToken?: string
    }
  }
}

export async function authenticateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header'
      }
    })
    return
  }

  const token = authHeader.substring(7)

  try {
    const session = await authService.validateSession(token)
    if (!session) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Session is invalid or expired'
        }
      })
      return
    }

    req.userId = session.userId
    req.sessionToken = token
    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to validate session'
      }
    })
  }
}