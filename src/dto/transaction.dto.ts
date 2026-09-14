import { z } from 'zod'

export const SendTransferSchema = z.object({
  toUserId: z.string().length(12),
  amount: z.number().positive(),
  idempotency_key: z.string().min(16).max(64),
  description: z.string().max(255).optional()
})

export const TransactionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().positive().optional().default(20)
})

export type SendTransferDTO = z.infer<typeof SendTransferSchema>
export type TransactionQueryDTO = z.infer<typeof TransactionQuerySchema>
