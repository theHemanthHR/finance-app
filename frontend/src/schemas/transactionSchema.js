import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().min(1, 'Description is required').max(200),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  currencyCode: z.string().length(3, 'Select a currency'),
  categoryId: z.string().uuid('Select a category'),
  transactionDate: z.string().min(1, 'Select a date'),
  notes: z.string().max(1000).optional().or(z.literal('')),
})
