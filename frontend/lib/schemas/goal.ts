/**
 * Goal schemas (Zod) for API request/response validation.
 */
import { z } from 'zod'

const goalTypeEnum = z.enum(['savings', 'debt_payoff', 'purchase', 'emergency_fund', 'other'])
const goalStatusEnum = z.enum(['active', 'completed', 'paused', 'cancelled'])

export const GoalSchema = z.object({
  id: z.number(),
  user_id: z.number().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  goal_type: z.string(),
  target_amount: z.number(),
  current_amount: z.number(),
  target_date: z.string().nullable().optional(),
  status: z.string(),
})
export type Goal = z.infer<typeof GoalSchema>

export const GoalsSchema = z.array(GoalSchema)
export type Goals = z.infer<typeof GoalsSchema>

export const GoalCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  goal_type: goalTypeEnum,
  target_amount: z.number().positive('Target amount must be positive'),
  current_amount: z.number().min(0).default(0),
  target_date: z.string().optional().nullable(),
})
export type GoalCreate = z.infer<typeof GoalCreateSchema>

export const GoalUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  goal_type: goalTypeEnum.optional(),
  target_amount: z.number().positive().optional(),
  current_amount: z.number().min(0).optional(),
  target_date: z.string().optional().nullable(),
  status: goalStatusEnum.optional(),
})
export type GoalUpdate = z.infer<typeof GoalUpdateSchema>
