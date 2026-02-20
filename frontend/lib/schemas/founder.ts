/**
 * Founder Overview / Metrics engine response schemas.
 */
import { z } from 'zod'

const KpiSchema = z.object({
  value: z.union([z.number(), z.null()]),
  trend: z.enum(['up', 'down', 'neutral']).optional(),
  sparkline: z.array(z.number()),
})

export const FounderKpisSchema = z.object({
  cash_balance: KpiSchema,
  monthly_burn: KpiSchema,
  runway_months: KpiSchema,
  mrr: KpiSchema,
  arr: KpiSchema,
  revenue_growth_pct: KpiSchema,
  cash_in_30d: KpiSchema,
  cash_out_30d: KpiSchema,
})

export const BurnForecastSchema = z.object({
  base_months: z.number().nullable(),
  conservative_months: z.number().nullable(),
  aggressive_months: z.number().nullable(),
})

export const BurnIntelligenceSchema = z.object({
  gross_burn_30d: z.number(),
  net_burn_30d: z.number(),
  net_burn_current_month: z.number(),
  burn_multiple: z.number().nullable(),
  avg_burn_3m: z.number(),
  runway_months: z.number().nullable(),
  runway_forecast: BurnForecastSchema,
})

export const SparklineMonthSchema = z.object({
  label: z.string(),
  income: z.number(),
  expenses: z.number(),
  net_burn: z.number(),
  net: z.number(),
})

export const FounderOverviewSchema = z.object({
  kpis: FounderKpisSchema,
  sparkline_months: z.array(SparklineMonthSchema),
  burn: BurnIntelligenceSchema,
  recent_net_30d: z.number(),
})

export type FounderKpis = z.infer<typeof FounderKpisSchema>
export type BurnIntelligence = z.infer<typeof BurnIntelligenceSchema>
export type BurnForecast = z.infer<typeof BurnForecastSchema>
export type SparklineMonth = z.infer<typeof SparklineMonthSchema>
export type FounderOverview = z.infer<typeof FounderOverviewSchema>
