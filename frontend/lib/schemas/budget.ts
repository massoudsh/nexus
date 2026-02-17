/**
 * Budget schemas (Zod) for API request/response validation.
 */
import { z } from 'zod'

const periodEnum = z.enum(['weekly', 'monthly', 'yearly'])

export const BudgetSchema = z.object({
  id: z.number(),
  user_id: z.number().optional(),
  category_id: z.number().nullable().optional(),
  name: z.string(),
  amount: z.number(),
  period: z.string(),
  start_date: z.string(),
  end_date: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})
export type Budget = z.infer<typeof BudgetSchema>

export const BudgetsSchema = z.array(BudgetSchema)
export type Budgets = z.infer<typeof BudgetsSchema>

export const BudgetCreateSchema = z.object({
  category_id: z.number().optional().nullable(),
  name: z.string().min(1, 'Name is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  period: periodEnum,
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional().nullable(),
})
export type BudgetCreate = z.infer<typeof BudgetCreateSchema>

export const BudgetUpdateSchema = z.object({
  category_id: z.number().optional().nullable(),
  name: z.string().min(1).max(100).optional(),
  amount: z.number().positive().optional(),
  period: periodEnum.optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
})
export type BudgetUpdate = z.infer<typeof BudgetUpdateSchema>

export const BudgetWithSpendingSchema = BudgetSchema.extend({
  spent: z.number().optional(),
  remaining: z.number().optional(),
  percentage_used: z.number().optional(),
})
export type BudgetWithSpending = z.infer<typeof BudgetWithSpendingSchema>
