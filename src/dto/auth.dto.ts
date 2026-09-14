import { z } from 'zod'

export const RoomCodeSchema = z.object({
  room_code: z.string().min(4).max(10)
})

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  password: z.string().min(6).max(128),
  room_code: z.string().min(4).max(10)
})

export const LoginSchema = z.object({
  userId: z.string().length(12),
  password: z.string().min(1)
})

export type RoomCodeDTO = z.infer<typeof RoomCodeSchema>
export type RegisterDTO = z.infer<typeof RegisterSchema>
export type LoginDTO = z.infer<typeof LoginSchema>
