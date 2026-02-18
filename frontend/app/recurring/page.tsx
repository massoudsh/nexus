'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { apiClient, getApiErrorMessage } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface RecurringRow {
  id: number
  account_id: number
  amount: number
  transaction_type: string
  description: string | null
  frequency: string
  next_run_date: string
  is_active: number
}

export default function RecurringPage() {
  const [list, setList] = useState<RecurringRow[]>([])
  const [accounts, setAccounts] = useState<Array<{ id: number; name: string; currency: string }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    account_id: '',
    amount: '',
    transaction_type: 'expense' as 'income' | 'expense',
    description: '',
    frequency: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    next_run_date: new Date().toISOString().slice(0, 10),
  })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const [rec, acc] = await Promise.all([apiClient.getRecurring(), apiClient.getAccounts()])
      setList(Array.isArray(rec) ? rec : [])
      setAccounts(Array.isArray(acc) ? acc : [])
    } catch {
      setList([])
      setAccounts([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const accountId = parseInt(form.account_id, 10)
    const amount = parseFloat(form.amount)
    if (!accountId || !amount || amount <= 0) {
      setError('Select an account and enter a positive amount.')
      return
    }
    setSaving(true)
    try {
      await apiClient.createRecurring({
        account_id: accountId,
        amount,
        transaction_type: form.transaction_type,
        description: form.description.trim() || undefined,
        frequency: form.frequency,
        next_run_date: form.next_run_date,
      })
      setForm({ ...form, amount: '', description: '' })
      load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this recurring transaction?')) return
    try {
      await apiClient.deleteRecurring(id)
      load()
    } catch {
      setError('Failed to delete')
    }
  }

  const accountName = (id: number) => accounts.find((a) => a.id === id)?.name ?? `Account ${id}`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recurring transactions</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Schedule income or expenses (e.g. monthly rent, salary). Next run date is for display; auto-creation can be added later.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add recurring</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
                <select
                  required
                  value={form.account_id}
                  onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={form.transaction_type}
                  onChange={(e) => setForm((f) => ({ ...f, transaction_type: e.target.value as 'income' | 'expense' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as 'weekly' | 'monthly' | 'yearly' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next run date</label>
              <input
                type="date"
                value={form.next_run_date}
                onChange={(e) => setForm((f) => ({ ...f, next_run_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g. Rent"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
            >
              {saving ? 'Adding...' : 'Add recurring'}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
            Scheduled
          </h2>
          {loading ? (
            <div className="p-6 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-gray-500 dark:text-gray-400">No recurring transactions yet. Add one above.</div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {list.map((r) => (
                <li key={r.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {r.description || 'Recurring'} · {formatCurrency(r.amount)} ({r.frequency})
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {accountName(r.account_id)} · Next: {r.next_run_date} · {r.transaction_type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/dashboard" className="text-primary-600 dark:text-primary-400 hover:underline">
            Back to dashboard
          </Link>
        </p>
      </main>
    </div>
  )
}
