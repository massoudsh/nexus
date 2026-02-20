'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { apiClient, getApiErrorMessage } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { fa } from '@/lib/fa'

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
    if (!confirm(fa.recurring.removeConfirm)) return
    try {
      await apiClient.deleteRecurring(id)
      load()
    } catch {
      setError('Failed to delete')
    }
  }

  const accountName = (id: number) => accounts.find((a) => a.id === id)?.name ?? `${fa.recurring.account} ${id}`

  return (
    <div className="min-h-screen bg-gray-100/80 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{fa.recurring.title}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {fa.recurring.scheduleDescription}
          </p>
        </div>

        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{fa.recurring.addRecurring}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.recurring.account}</label>
                <select
                  required
                  value={form.account_id}
                  onChange={(e) => setForm((f) => ({ ...f, account_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{fa.recurring.select}</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.recurring.amount}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.recurring.type}</label>
                <select
                  value={form.transaction_type}
                  onChange={(e) => setForm((f) => ({ ...f, transaction_type: e.target.value as 'income' | 'expense' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="expense">{fa.recurring.expense}</option>
                  <option value="income">{fa.recurring.income}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.recurring.frequency}</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as 'weekly' | 'monthly' | 'yearly' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="weekly">{fa.recurring.weekly}</option>
                  <option value="monthly">{fa.recurring.monthly}</option>
                  <option value="yearly">{fa.recurring.yearly}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.recurring.nextRunDate}</label>
              <input
                type="date"
                value={form.next_run_date}
                onChange={(e) => setForm((f) => ({ ...f, next_run_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.recurring.descriptionOptional}</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="مثلاً اجاره"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 text-sm font-medium"
            >
              {saving ? fa.recurring.addingRecurring : fa.recurring.addRecurring}
            </button>
          </form>
        </div>

        <div className="card overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
            {fa.recurring.scheduled}
          </h2>
          {loading ? (
            <div className="p-6 text-gray-500 dark:text-gray-400">{fa.common.loading}</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-gray-500 dark:text-gray-400">{fa.recurring.noRecurringYet} {fa.recurring.addOneAbove}</div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {list.map((r) => (
                <li key={r.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {r.description || fa.recurring.addRecurring} · {formatCurrency(r.amount)} ({r.frequency === 'weekly' ? fa.recurring.weekly : r.frequency === 'monthly' ? fa.recurring.monthly : fa.recurring.yearly})
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {accountName(r.account_id)} · {fa.recurring.nextRunDate}: {r.next_run_date} · {r.transaction_type === 'income' ? fa.recurring.income : fa.recurring.expense}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    {fa.recurring.remove}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/dashboard" className="text-primary-600 dark:text-primary-400 hover:underline">
            {fa.recurring.backToDashboard}
          </Link>
        </p>
      </main>
    </div>
  )
}
