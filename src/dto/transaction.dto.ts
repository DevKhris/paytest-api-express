import { z } from 'zod'

export const SendBalanceSchema = z.object({
  toUserId: z.string().min(1),
  amount: z.number().positive()
})

export const TransactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20)
})

export type SendBalanceDTO = z.infer<typeof SendBalanceSchema>
export type TransactionQueryDTO = z.infer<typeof TransactionQuerySchema>
