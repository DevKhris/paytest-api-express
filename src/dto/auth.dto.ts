import { z } from 'zod'

export const JoinRoomSchema = z.object({
  roomCode: z.string().min(1).max(20),
  name: z.string().min(2).max(50),
  password: z.string().min(6).max(100)
})

export const LoginSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(1)
})

export type JoinRoomDTO = z.infer<typeof JoinRoomSchema>
export type LoginDTO = z.infer<typeof LoginSchema>