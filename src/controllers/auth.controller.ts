import { Request, Response } from 'express'
import { AuthService } from '../services/AuthService'
import { RoomCodeSchema, RegisterSchema, LoginSchema } from '../dto/auth.dto'

const authService = new AuthService()

export class AuthController {
  async validateRoomCode(req: Request, res: Response): Promise<void> {
    const result = RoomCodeSchema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten().fieldErrors })
      return
    }

    try {
      const { room_code } = result.data
      const valid = await authService.validateRoomCode(room_code)

      if (!valid) {
        res.status(400).json({ error: 'Invalid room code' })
        return
      }

      res.status(200).json({
        message: 'Room code valid',
        room_code
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(400).json({ error: message })
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    const result = RegisterSchema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten().fieldErrors })
      return
    }

    try {
      const { name, password, room_code } = result.data
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown'
      const userAgent = req.headers['user-agent'] || 'unknown'

      const { user, session, expiresIn } = await authService.register(
        name,
        password,
        room_code,
        ipAddress,
        userAgent
      )

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          userId: user.id,
          name: user.name,
          created_at: user.createdAt?.toISOString() || new Date().toISOString()
        },
        token: {
          access_token: session.token,
          token_type: 'Bearer',
          expires_in: expiresIn
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('already exists')) {
        res.status(400).json({ error: message })
        return
      }
      res.status(500).json({ error: message })
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = LoginSchema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({ error: result.error.flatten().fieldErrors })
      return
    }

    try {
      const { userId, password } = result.data
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown'
      const userAgent = req.headers['user-agent'] || 'unknown'

      const { user, session, expiresIn } = await authService.login(
        userId,
        password,
        ipAddress,
        userAgent
      )

      res.status(200).json({
        message: 'Login successful',
        user: {
          userId: user.id,
          name: user.name,
          created_at: user.createdAt?.toISOString() || new Date().toISOString()
        },
        token: {
          access_token: session.token,
          token_type: 'Bearer',
          expires_in: expiresIn
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('invalid')) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }
      res.status(500).json({ error: message })
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.sessionToken!
      await authService.logout(token)

      res.status(200).json({
        message: 'Logout successful'
      })
    } catch (error) {
      res.status(200).json({
        message: 'Logout successful'
      })
    }
  }
}
