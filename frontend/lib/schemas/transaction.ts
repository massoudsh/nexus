/**
 * Transaction schemas (Zod) for API request/response validation.
 */
import { z } from 'zod'

const transactionTypeEnum = z.enum(['income', 'expense', 'transfer'])

export const TransactionSchema = z.object({
  id: z.number(),
  user_id: z.number().optional(),
  account_id: z.number(),
  category_id: z.number().nullable().optional(),
  amount: z.number(),
  transaction_type: z.string(),
  description: z.string().nullable().optional(),
  date: z.string(),
  notes: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})
export type Transaction = z.infer<typeof TransactionSchema>

export const TransactionsSchema = z.array(TransactionSchema)
export type Transactions = z.infer<typeof TransactionsSchema>

export const TransactionCreateSchema = z.object({
  account_id: z.number({ required_error: 'Account is required' }),
  category_id: z.number().optional().nullable(),
  amount: z.number().positive('Amount must be positive'),
  transaction_type: transactionTypeEnum,
  description: z.string().max(500).optional().nullable(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(1000).optional().nullable(),
})
export type TransactionCreate = z.infer<typeof TransactionCreateSchema>

export const TransactionUpdateSchema = z.object({
  account_id: z.number().optional(),
  category_id: z.number().optional().nullable(),
  amount: z.number().positive().optional(),
  transaction_type: transactionTypeEnum.optional(),
  description: z.string().max(500).optional().nullable(),
  date: z.string().optional(),
  notes: z.string().max(1000).optional().nullable(),
})
export type TransactionUpdate = z.infer<typeof TransactionUpdateSchema>
