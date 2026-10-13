import { z } from 'zod'

export const budgetSchema = z.object({
  categoryId: z.string().uuid('Select a category'),
  monthStart: z.string().min(1, 'Select a month'),
  limitAmountBase: z.coerce.number().min(0, 'Limit cannot be negative'),
})
