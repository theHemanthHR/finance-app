import { z } from 'zod'

export const goalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  description: z.string().max(500).optional().or(z.literal('')),
  targetAmount: z.coerce.number().positive('Target must be greater than zero'),
  targetDate: z.string().optional().or(z.literal('')),
})

export const contributionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  contributionDate: z.string().min(1, 'Select a date'),
  note: z.string().max(300).optional().or(z.literal('')),
})
