import { Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { JoinRoomSchema, LoginSchema } from '../dto/auth.dto'

const authService = new AuthService()

export class AuthController {
  async join(req: Request, res: Response): Promise<void> {
    try {
      const result = JoinRoomSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: result.error.flatten().fieldErrors
          }
        })
        return
      }

      const { roomCode, name, password } = result.data
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown'
      const userAgent = req.headers['user-agent'] || 'unknown'

      const { user, account, session, initialBalance } = await authService.join(
        roomCode,
        name,
        password,
        ipAddress,
        userAgent
      )

      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          name: user.name,
          accountId: account.id,
          token: session.token,
          initialBalance
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({
        success: false,
        error: {
          code: 'JOIN_FAILED',
          message
        }
      })
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = LoginSchema.safeParse(req.body)
      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: result.error.flatten().fieldErrors
          }
        })
        return
      }

      const { userId, password } = result.data
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown'
      const userAgent = req.headers['user-agent'] || 'unknown'

      const { user, session } = await authService.login(
        userId,
        password,
        ipAddress,
        userAgent
      )

      res.status(200).json({
        success: true,
        data: {
          userId: user.id,
          name: user.name,
          token: session.token
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message
        }
      })
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.sessionToken!
      await authService.logout(token)

      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully'
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message
        }
      })
    }
  }
}