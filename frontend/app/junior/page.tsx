'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { apiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { fa } from '@/lib/fa'

export default function JuniorSavingsPage() {
  return (
    <ProtectedRoute>
      <JuniorSavingsContent />
    </ProtectedRoute>
  )
}

function JuniorSavingsContent() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfiles = useCallback(async () => {
    try {
      const data = await apiClient.getJuniorProfiles()
      setProfiles(Array.isArray(data) ? data : [])
    } catch {
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiClient.createJuniorProfile({ name: newName.trim(), currency: 'IRT' })
      setNewName('')
      setShowAddForm(false)
      await loadProfiles()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : fa.auth.registrationFailed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100/80 dark:bg-gray-950">
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{fa.junior.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {fa.junior.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="bg-primary-500 text-white px-4 py-2.5 rounded-xl hover:bg-primary-600 font-medium text-sm shadow-sm"
            >
              {fa.junior.addChild}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-6 card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{fa.junior.addAChild}</h3>
              <form onSubmit={handleAddChild} className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="child-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fa.junior.name}</label>
                  <input
                    id="child-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={fa.junior.childName}
                    className="rounded-xl border border-gray-300 dark:border-gray-600 px-3 py-2 w-48 dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <button type="submit" disabled={submitting} className="bg-primary-500 text-white px-4 py-2.5 rounded-xl hover:bg-primary-600 disabled:opacity-50 text-sm font-medium">
                  {submitting ? fa.junior.adding : fa.junior.add}
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); setError(null); }} className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium">
                  {fa.common.cancel}
                </button>
              </form>
              {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">{fa.common.loading}</div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 card p-8">
              <p className="text-gray-500 dark:text-gray-400">{fa.junior.noChildrenYet} {fa.junior.addChildToStart}</p>
              <button type="button" onClick={() => setShowAddForm(true)} className="mt-4 text-primary-600 dark:text-primary-400 font-medium">
                {fa.junior.addChild}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((p) => (
                <Link key={p.id} href={`/junior/${p.id}`} className="block card p-6 hover:shadow-soft transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-semibold text-lg">
                      {p.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                      <p className="text-lg font-medium text-primary-600 dark:text-primary-400">{formatCurrency(p.balance ?? 0, p.currency ?? 'IRT')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{fa.junior.viewGoalsDepositsRewards}</p>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 p-6 rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10">
            <h3 className="font-semibold text-gray-900 dark:text-white">{fa.junior.whyJunior}</h3>
            <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>{fa.junior.why1}</li>
              <li>{fa.junior.why2}</li>
              <li>{fa.junior.why3}</li>
              <li>{fa.junior.why4}</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
