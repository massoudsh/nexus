'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import { getApiErrorMessage } from '@/lib/api'

export default function ReportsPage() {
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([])
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  const handleExportTransactions = async () => {
    setExporting(true)
    setExportError(null)
    try {
      const blob = await apiClient.exportTransactions()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transactions.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setExportError(getApiErrorMessage(err))
    } finally {
      setExporting(false)
    }
  }

  const loadReports = async () => {
    try {
      const [expenses, incomeExpenses] = await Promise.all([
        apiClient.getExpensesByCategory(),
        apiClient.getIncomeVsExpenses()
      ])
      setExpensesByCategory(expenses)
      setIncomeVsExpenses(incomeExpenses)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
            <button
              type="button"
              onClick={handleExportTransactions}
              disabled={exporting}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export transactions (CSV)'}
            </button>
          </div>
          {exportError && (
            <p className="mb-4 text-sm text-red-600">{exportError}</p>
          )}

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="space-y-6">
              {incomeVsExpenses && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Income vs Expenses</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Income</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(incomeVsExpenses.income)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expenses</p>
                      <p className="text-xl font-bold text-red-600">{formatCurrency(incomeVsExpenses.expenses)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Net</p>
                      <p className={`text-xl font-bold ${incomeVsExpenses.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(incomeVsExpenses.net)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Expenses by Category</h3>
                {expensesByCategory.length === 0 ? (
                  <p className="text-gray-500">No expense data available</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {expensesByCategory.map((item, index) => (
                      <li key={index} className="py-3 flex justify-between">
                        <span className="text-gray-900">Category {item.category_id || 'Uncategorized'}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(item.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

