import { z } from 'zod'

export const AddContactSchema = z.object({
  userId: z.string().min(1)
})

export type AddContactDTO = z.infer<typeof AddContactSchema>
