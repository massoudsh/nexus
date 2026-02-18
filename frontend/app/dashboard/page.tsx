'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { format, subDays } from 'date-fns'
import Navbar from '@/components/layout/Navbar'
import ExpenseChart from '@/components/charts/ExpenseChart'
import IncomeExpenseBar from '@/components/charts/IncomeExpenseBar'
import { BudgetAlerts } from '@/components/dashboard/BudgetAlerts'
import type { DashboardSummary } from '@/lib/schemas/dashboard'
import type { Accounts } from '@/lib/schemas/account'
import type { ExpensesByCategory, IncomeVsExpenses } from '@/lib/schemas/reports'

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [accounts, setAccounts] = useState<Accounts>([])
  const [expensesByCategory, setExpensesByCategory] = useState<ExpensesByCategory>([])
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<IncomeVsExpenses | null>(null)
  const [budgets, setBudgets] = useState<Array<{ id: number; name: string; amount: number; spent?: number; percentage_used?: number }>>([])
  const [goals, setGoals] = useState<Array<{ id: number; name: string; target_amount: number; current_amount: number; status: string }>>([])
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [dateRangeDays, setDateRangeDays] = useState(30)

  useEffect(() => {
    loadDashboard()
  }, [dateRangeDays])

  const loadDashboard = async () => {
    try {
      const start = format(subDays(new Date(), dateRangeDays), "yyyy-MM-dd'T'HH:mm:ssxxx")
      const end = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssxxx")
      const [summaryData, accountsData, expByCat, incVsExp, budgetsData, goalsData] = await Promise.all([
        apiClient.getDashboardSummary(),
        apiClient.getAccounts(),
        apiClient.getExpensesByCategory(start, end),
        apiClient.getIncomeVsExpenses(start, end),
        apiClient.getBudgets().catch(() => []),
        apiClient.getGoals().catch(() => []),
      ])
      setSummary(summaryData)
      setAccounts(accountsData)
      setExpensesByCategory(expByCat)
      setIncomeVsExpenses(incVsExp)
      setBudgets(Array.isArray(budgetsData) ? budgetsData : [])
      setGoals(Array.isArray(goalsData) ? goalsData : [])
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      const status = (error as any)?.response?.status
      if (status === 401) {
        setIsGuest(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-white rounded-lg shadow" />
              <div className="h-28 bg-white rounded-lg shadow" />
              <div className="h-28 bg-white rounded-lg shadow" />
              <div className="h-28 bg-white rounded-lg shadow" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="h-80 bg-white rounded-lg shadow lg:col-span-2" />
              <div className="h-80 bg-white rounded-lg shadow" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isGuest) {
    const guestSummary: DashboardSummary = {
      total_balance: 0,
      month_income: 0,
      month_expenses: 0,
      month_net: 0,
      active_budgets: 0,
      active_goals: 0,
      recent_transactions: [],
    }

    const guestAccounts = [
      { id: 1, name: 'Checking', account_type: 'CHECKING', balance: 2450.12, currency: 'USD' },
      { id: 2, name: 'Savings', account_type: 'SAVINGS', balance: 12850.0, currency: 'USD' },
      { id: 3, name: 'Credit Card', account_type: 'CREDIT_CARD', balance: -420.55, currency: 'USD' },
    ]

    const guestExpensesByCategory = [
      { name: 'Groceries', value: 520 },
      { name: 'Rent', value: 1800 },
      { name: 'Transport', value: 210 },
      { name: 'Dining', value: 140 },
      { name: 'Subscriptions', value: 65 },
    ]

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-900">
              You’re in <span className="font-semibold">Guest Mode</span>. Create an account to connect your real accounts and track
              spending.
            </div>

            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                <p className="text-sm text-gray-600 mt-1">A realistic sample dashboard so you can explore the UI without signing in.</p>
              </div>
              <Link
                href="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm font-medium"
              >
                Create account
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">Net worth</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(14879.57)}</p>
                <p className="mt-1 text-xs text-gray-500">Across {guestAccounts.length} accounts</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">Income (30d)</p>
                <p className="mt-2 text-2xl font-semibold text-green-700">{formatCurrency(4200)}</p>
                <p className="mt-1 text-xs text-gray-500">Paychecks + other income</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">Spending (30d)</p>
                <p className="mt-2 text-2xl font-semibold text-red-700">{formatCurrency(2735)}</p>
                <p className="mt-1 text-xs text-gray-500">Bills + day-to-day</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <p className="text-sm text-gray-500">Savings rate</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">35%</p>
                <p className="mt-1 text-xs text-gray-500">Income minus spending</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-900">Cashflow snapshot</h3>
                  <span className="text-xs text-gray-500">Last 30 days</span>
                </div>
                <IncomeExpenseBar
                  data={[
                    { name: '30d', income: 4200, expenses: 2735, net: 1465 },
                  ]}
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-900">Spending by category</h3>
                  <span className="text-xs text-gray-500">Sample</span>
                </div>
                <ExpenseChart data={guestExpensesByCategory} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Accounts</h3>
                <div className="space-y-3">
                  {guestAccounts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-500">{a.account_type.replace('_', ' ')}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(a.balance)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Recent activity</h3>
                <p className="text-sm text-gray-600">
                  Sign in to track real transactions and see your recent activity here.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link href="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm font-medium">
                    Create account
                  </Link>
                  <Link href="/login" className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load dashboard</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <BudgetAlerts />
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
              <p className="text-sm text-gray-600 mt-1">Last refresh: {format(new Date(), 'PPpp')}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/transactions" className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Add transaction
              </Link>
              <Link href="/accounts" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm font-medium">
                Add account
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total balance</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900">{formatCurrency(summary.total_balance)}</p>
              <p className="mt-1 text-xs text-gray-500">Across {accounts.length} active accounts</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Income (month)</p>
              <p className="mt-2 text-2xl font-semibold text-green-700">{formatCurrency(summary.month_income)}</p>
              <p className="mt-1 text-xs text-gray-500">This month to date</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Expenses (month)</p>
              <p className="mt-2 text-2xl font-semibold text-red-700">{formatCurrency(summary.month_expenses)}</p>
              <p className="mt-1 text-xs text-gray-500">This month to date</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Net (month)</p>
              <p className={['mt-2 text-2xl font-semibold', summary.month_net >= 0 ? 'text-green-700' : 'text-red-700'].join(' ')}>
                {formatCurrency(summary.month_net)}
              </p>
              <p className="mt-1 text-xs text-gray-500">{summary.active_budgets} budgets • {summary.active_goals} goals</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <span className="text-sm text-gray-600">Date range:</span>
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDateRangeDays(d)}
                className={`px-3 py-1 rounded text-sm font-medium ${dateRangeDays === d ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                {d}d
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Income vs expenses</h3>
                <span className="text-xs text-gray-500">Last {dateRangeDays} days</span>
              </div>
              <IncomeExpenseBar
                data={[
                  {
                    name: '30d',
                    income: incomeVsExpenses?.income ?? 0,
                    expenses: incomeVsExpenses?.expenses ?? 0,
                    net: incomeVsExpenses?.net ?? 0,
                  },
                ]}
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900">Spending by category</h3>
                <span className="text-xs text-gray-500">Last {dateRangeDays} days</span>
              </div>
              <ExpenseChart
                data={expensesByCategory.map((x) => ({
                  name: x.category_id ? `Category ${x.category_id}` : 'Uncategorized',
                  value: x.total,
                }))}
              />
              {expensesByCategory.length === 0 && (
                <p className="text-sm text-gray-500 mt-3">No expense data yet—add a few transactions to see insights.</p>
              )}
            </div>
          </div>

          {(budgets.length > 0 || goals.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {budgets.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">Budget progress</h3>
                    <Link href="/budgets" className="text-sm text-primary-700 hover:text-primary-800">View all</Link>
                  </div>
                  <div className="space-y-3">
                    {budgets.slice(0, 3).map((b) => {
                      const pct = (b as { percentage_used?: number }).percentage_used ?? (typeof (b as { spent?: number }).spent === 'number' && b.amount ? Math.min(100, ((b as { spent?: number }).spent! / b.amount) * 100) : 0)
                      return (
                        <div key={b.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-900">{b.name}</span>
                            <span className="text-gray-600">{Math.round(pct)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary-600 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {goals.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">Goal progress</h3>
                    <Link href="/goals" className="text-sm text-primary-700 hover:text-primary-800">View all</Link>
                  </div>
                  <div className="space-y-3">
                    {goals.slice(0, 3).map((g) => {
                      const pct = g.target_amount > 0 ? Math.min(100, (g.current_amount / g.target_amount) * 100) : 0
                      return (
                        <div key={g.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-900">{g.name}</span>
                            <span className="text-gray-600">{formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Accounts</h3>
              {accounts.length === 0 ? (
                <p className="text-sm text-gray-500">No accounts yet. Add an account to start tracking balances.</p>
              ) : (
                <div className="space-y-3">
                  {accounts.slice(0, 6).map((a) => (
                    <div key={a.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-500">{a.account_type.replace('_', ' ')}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(a.balance, a.currency)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Recent transactions</h3>
                <Link href="/transactions" className="text-sm text-primary-700 hover:text-primary-800">
                  View all
                </Link>
              </div>
              {summary.recent_transactions.length === 0 ? (
                <p className="text-sm text-gray-500">No transactions yet. Add one to start seeing cashflow.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {summary.recent_transactions.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.description || 'Transaction'}</p>
                        <p className="text-xs text-gray-500">{format(new Date(t.date), 'PP')}</p>
                      </div>
                      <div className="text-right">
                        <p className={['text-sm font-semibold', t.type === 'income' ? 'text-green-700' : 'text-red-700'].join(' ')}>
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{t.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

