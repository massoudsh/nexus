'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { apiClient } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function JuniorDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const [summary, setSummary] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [deposits, setDeposits] = useState<any[]>([])
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || isNaN(id)) return
    let c = false
    async function load() {
      try {
        const [dash, g, d, r] = await Promise.all([
          apiClient.getJuniorDashboard(id),
          apiClient.getJuniorGoals(id),
          apiClient.getJuniorDeposits(id),
          apiClient.getJuniorRewards(id),
        ])
        if (!c) {
          setSummary(dash)
          setGoals(Array.isArray(g) ? g : [])
          setDeposits(Array.isArray(d) ? d : [])
          setRewards(Array.isArray(r) ? r : [])
        }
      } catch {
        if (!c) setError('Failed to load')
      } finally {
        if (!c) setLoading(false)
      }
    }
    load()
    return () => { c = true }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 px-4"><p>Loading...</p></main>
      </div>
    )
  }
  if (error || !summary?.profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 px-4">
          <p className="text-red-600">{error ?? 'Not found'}</p>
          <Link href="/junior" className="text-primary-600 mt-2 inline-block">Back to Junior Savings</Link>
        </main>
      </div>
    )
  }

  const profile = summary.profile
  const pct = (g: any) => (g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link href="/junior" className="text-sm text-primary-600 hover:text-primary-700 mb-4 inline-block">Back to Junior Savings</Link>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-2xl">
              {profile.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-2xl font-semibold text-primary-600">{formatCurrency(profile.balance ?? 0, profile.currency ?? 'USD')} saved</p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Goals</h2>
            {goals.length === 0 ? (
              <p className="text-gray-500">No goals yet.</p>
            ) : (
              <div className="space-y-4">
                {goals.map((g) => (
                  <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{g.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{g.status}</span>
                    </div>
                    <p className="text-sm text-gray-500">{formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)}</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min(pct(g), 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Automated deposits</h2>
            {deposits.length === 0 ? (
              <p className="text-gray-500">No scheduled deposits.</p>
            ) : (
              <ul className="space-y-2">
                {deposits.map((d) => (
                  <li key={d.id} className="bg-white rounded-lg border px-4 py-3 flex justify-between">
                    <span>{formatCurrency(d.amount)} {d.frequency}</span>
                    <span className="text-gray-500">Next: {d.next_run_date ? formatDate(d.next_run_date) : '-'}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Rewards</h2>
            {rewards.length === 0 ? (
              <p className="text-gray-500">No rewards yet.</p>
            ) : (
              <ul className="space-y-2">
                {rewards.map((r) => (
                  <li key={r.id} className="bg-white rounded-lg border px-4 py-3 flex justify-between">
                    <span>{r.title ?? r.reward_type}</span>
                    <span className="text-gray-500 text-sm">{r.achieved_at ? formatDate(r.achieved_at) : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="p-6 bg-amber-50 rounded-xl border border-amber-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Financial education</h2>
            <ul className="text-sm text-gray-700 space-y-2">
              <li><strong>Save first.</strong> Put a little aside before spending.</li>
              <li><strong>Goals help.</strong> Saving for something you want makes it easier.</li>
              <li><strong>Small steps count.</strong> A little every week adds up.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
