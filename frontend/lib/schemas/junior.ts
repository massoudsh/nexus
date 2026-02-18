import { z } from 'zod'

export const JuniorProfileSchema = z.object({
  id: z.number(),
  parent_id: z.number(),
  name: z.string(),
  balance: z.number(),
  currency: z.string(),
  allowance_amount: z.number().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().nullable().optional(),
})
export type JuniorProfile = z.infer<typeof JuniorProfileSchema>

export const JuniorGoalSchema = z.object({
  id: z.number(),
  junior_profile_id: z.number(),
  name: z.string(),
  target_amount: z.number(),
  current_amount: z.number(),
  target_date: z.string().nullable().optional(),
  status: z.string(),
  parent_approved: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().nullable().optional(),
})
export type JuniorGoal = z.infer<typeof JuniorGoalSchema>

export const AutomatedDepositSchema = z.object({
  id: z.number(),
  source_account_id: z.number(),
  junior_profile_id: z.number(),
  amount: z.number(),
  frequency: z.string(),
  next_run_date: z.string(),
  last_run_at: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().nullable().optional(),
})
export type AutomatedDeposit = z.infer<typeof AutomatedDepositSchema>

export const RewardSchema = z.object({
  id: z.number(),
  junior_profile_id: z.number(),
  reward_type: z.string(),
  title: z.string().nullable().optional(),
  achieved_at: z.string(),
  created_at: z.string().optional(),
})
export type Reward = z.infer<typeof RewardSchema>

export const JuniorDashboardSummarySchema = z.object({
  profile: JuniorProfileSchema,
  goals_total: z.number(),
  goals_active: z.number(),
  goals_completed: z.number(),
  next_deposit: AutomatedDepositSchema.nullable().optional(),
  next_deposit_date: z.string().nullable().optional(),
  rewards_count: z.number(),
  recent_rewards: z.array(RewardSchema),
})
export type JuniorDashboardSummary = z.infer<typeof JuniorDashboardSummarySchema>
