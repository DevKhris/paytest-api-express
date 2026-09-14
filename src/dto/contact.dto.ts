import { z } from 'zod'

export const AddContactSchema = z.object({
  contactUserId: z.string().length(12)
})

export type AddContactDTO = z.infer<typeof AddContactSchema>
