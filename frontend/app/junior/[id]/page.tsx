'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { fa } from '@/lib/fa'
import type { JuniorGoal, AutomatedDeposit, Reward } from '@/lib/schemas/junior'
import type { Account } from '@/lib/schemas/account'

export default function JuniorDetailPage() {
  return (
    <ProtectedRoute>
      <JuniorDetailContent />
    </ProtectedRoute>
  )
}

function JuniorDetailContent() {
  const params = useParams()
  const id = Number(params?.id)
  const [summary, setSummary] = useState<any>(null)
  const [goals, setGoals] = useState<JuniorGoal[]>([])
  const [deposits, setDeposits] = useState<AutomatedDeposit[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    if (!id || isNaN(id)) return
    try {
      const [dash, g, d, r, acc] = await Promise.all([
        apiClient.getJuniorDashboard(id),
        apiClient.getJuniorGoals(id),
        apiClient.getJuniorDeposits(id),
        apiClient.getJuniorRewards(id),
        apiClient.getAccounts(),
      ])
      setSummary(dash)
      setGoals(Array.isArray(g) ? g : [])
      setDeposits(Array.isArray(d) ? d : [])
      setRewards(Array.isArray(r) ? r : [])
      setAccounts(Array.isArray(acc) ? acc : [])
    } catch {
      setError(fa.junior.failedToLoad)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100/80 dark:bg-gray-950">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 px-4">
          <p className="text-gray-500 dark:text-gray-400">{fa.common.loading}</p>
        </main>
      </div>
    )
  }
  if (error || !summary?.profile) {
    return (
      <div className="min-h-screen bg-gray-100/80 dark:bg-gray-950">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 px-4">
          <p className="text-red-600 dark:text-red-400">{error ?? fa.junior.notFound}</p>
          <Link href="/junior" className="text-primary-600 dark:text-primary-400 mt-2 inline-block">{fa.junior.backToJuniorSavings}</Link>
        </main>
      </div>
    )
  }

  const profile = summary.profile
  const pct = (g: JuniorGoal) => (g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0)

  return (
    <div className="min-h-screen bg-gray-100/80 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link href="/junior" className="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-4 inline-block">
            {fa.junior.backToJuniorSavings}
          </Link>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-2xl">
              {profile.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
              <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                {formatCurrency(profile.balance ?? 0, profile.currency ?? 'IRT')} {fa.junior.saved}
              </p>
            </div>
          </div>

          <JuniorGoalsSection profileId={id} goals={goals} onReload={loadAll} />
          <JuniorDepositsSection profileId={id} deposits={deposits} accounts={accounts} onReload={loadAll} />
          <JuniorRewardsSection profileId={id} rewards={rewards} onReload={loadAll} />

          <section className="p-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{fa.junior.financialEducation}</h2>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>{fa.junior.saveFirstTip}</strong></li>
              <li><strong>{fa.junior.goalsHelp}</strong></li>
              <li><strong>{fa.junior.smallStepsCount}</strong></li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}

function JuniorGoalsSection({
  profileId,
  goals,
  onReload,
}: {
  profileId: number
  goals: JuniorGoal[]
  onReload: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [approvingId, setApprovingId] = useState<number | null>(null)

  const pct = (g: JuniorGoal) => (g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(targetAmount)
    if (!name.trim() || !amount || amount <= 0) return
    setSubmitting(true)
    try {
      await apiClient.createJuniorGoal(profileId, {
        name: name.trim(),
        target_amount: amount,
        target_date: targetDate || undefined,
      })
      setName('')
      setTargetAmount('')
      setTargetDate('')
      setShowForm(false)
      onReload()
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (goalId: number) => {
    setApprovingId(goalId)
    try {
      await apiClient.approveJuniorGoal(profileId, goalId)
      onReload()
    } finally {
      setApprovingId(null)
    }
  }

  const statusLabel: Record<string, string> = {
    pending_approval: 'در انتظار تأیید',
    active: 'فعال',
    completed: 'تکمیل‌شده',
    cancelled: 'لغو',
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{fa.junior.goals}</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          {showForm ? fa.common.cancel : fa.junior.createGoal}
        </button>
      </div>
      {showForm && (
        <div className="card p-4 mb-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.junior.goalName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.junior.targetAmount}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.junior.targetDate}</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button type="submit" disabled={submitting} className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
              {submitting ? fa.junior.adding : fa.junior.add}
            </button>
          </form>
        </div>
      )}
      {goals.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">{fa.junior.noGoalsYet}</p>
      ) : (
        <div className="space-y-4">
          {goals.map((g) => (
            <div key={g.id} className="card p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 dark:text-white">{g.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {statusLabel[g.status] ?? g.status}
                  </span>
                  {g.status === 'pending_approval' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(g.id)}
                      disabled={approvingId === g.id}
                      className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                    >
                      {approvingId === g.id ? fa.common.loading : fa.junior.approveGoal}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)}
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${Math.min(pct(g), 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function JuniorDepositsSection({
  profileId,
  deposits,
  accounts,
  onReload,
}: {
  profileId: number
  deposits: AutomatedDeposit[]
  accounts: Account[]
  onReload: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [sourceAccountId, setSourceAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly')
  const [nextRunDate, setNextRunDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const accountId = parseInt(sourceAccountId, 10)
    const amt = parseFloat(amount)
    if (!accountId || !amt || amt <= 0) return
    setSubmitting(true)
    try {
      await apiClient.createJuniorDeposit(profileId, {
        source_account_id: accountId,
        amount: amt,
        frequency,
        next_run_date: nextRunDate,
      })
      setSourceAccountId('')
      setAmount('')
      setNextRunDate(new Date().toISOString().slice(0, 10))
      setShowForm(false)
      onReload()
    } finally {
      setSubmitting(false)
    }
  }

  const freqLabel: Record<string, string> = {
    weekly: fa.junior.weekly,
    biweekly: fa.junior.biweekly,
    monthly: fa.junior.monthly,
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{fa.junior.automatedDeposits}</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          {showForm ? fa.common.cancel : fa.junior.createDeposit}
        </button>
      </div>
      {showForm && (
        <div className="card p-4 mb-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.junior.sourceAccount}</label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              >
                <option value="">{fa.recurring.select}</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.junior.amount}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.recurring.frequency}</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'weekly' | 'biweekly' | 'monthly')}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="weekly">{fa.junior.weekly}</option>
                <option value="biweekly">{fa.junior.biweekly}</option>
                <option value="monthly">{fa.junior.monthly}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.junior.nextRunDate}</label>
              <input
                type="date"
                value={nextRunDate}
                onChange={(e) => setNextRunDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <button type="submit" disabled={submitting} className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
              {submitting ? fa.junior.adding : fa.junior.add}
            </button>
          </form>
        </div>
      )}
      {deposits.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">{fa.junior.noDepositsYet}</p>
      ) : (
        <ul className="space-y-2">
          {deposits.map((d) => (
            <li key={d.id} className="card px-4 py-3 flex justify-between items-center">
              <span>{formatCurrency(d.amount)} {freqLabel[d.frequency] ?? d.frequency}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{fa.junior.nextRun}: {d.next_run_date ? formatDate(d.next_run_date) : '-'}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function JuniorRewardsSection({
  profileId,
  rewards,
  onReload,
}: {
  profileId: number
  rewards: Reward[]
  onReload: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [rewardType, setRewardType] = useState<string>('custom')
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await apiClient.createJuniorReward(profileId, {
        reward_type: rewardType,
        title: title.trim() || undefined,
      })
      setTitle('')
      setShowForm(false)
      onReload()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{fa.junior.rewards}</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          {showForm ? fa.common.cancel : fa.junior.addReward}
        </button>
      </div>
      {showForm && (
        <div className="card p-4 mb-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.junior.rewardType}</label>
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="first_save">اولین پس‌انداز</option>
                <option value="first_goal">اولین هدف</option>
                <option value="goal_achiever">تحقق هدف</option>
                <option value="custom">{fa.junior.custom}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.recurring.descriptionOptional}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={fa.junior.custom}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button type="submit" disabled={submitting} className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
              {submitting ? fa.junior.adding : fa.junior.add}
            </button>
          </form>
        </div>
      )}
      {rewards.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">{fa.junior.noRewardsYet}</p>
      ) : (
        <ul className="space-y-2">
          {rewards.map((r) => (
            <li key={r.id} className="card px-4 py-3 flex justify-between items-center">
              <span className="text-gray-900 dark:text-white">{r.title ?? r.reward_type}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{r.achieved_at ? formatDate(r.achieved_at) : ''}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
