'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/utils'
import Link from 'next/link'

interface AlertItem {
  budget_id: number
  budget_name: string
  spent: number
  budget_amount: number
  percentage: number
  alert_type: string
}

export function BudgetAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .getAlerts()
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || alerts.length === 0) return null

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-semibold text-amber-900 mb-2">Budget alerts</h3>
      <ul className="space-y-2">
        {alerts.map((a) => (
          <li key={a.budget_id} className="flex items-center justify-between text-sm">
            <Link href="/budgets" className="font-medium text-amber-900 hover:underline">
              {a.budget_name}
            </Link>
            <span className={a.alert_type === 'critical' ? 'text-red-700 font-medium' : 'text-amber-800'}>
              {formatCurrency(a.spent)} / {formatCurrency(a.budget_amount)} ({formatNumber(Math.round(a.percentage))}٪)
            </span>
          </li>
        ))}
      </ul>
      <Link href="/budgets" className="mt-2 inline-block text-sm font-medium text-amber-800 hover:text-amber-900">
        View budgets →
      </Link>
    </div>
  )
}
