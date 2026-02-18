'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { apiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

export default function JuniorSavingsPage() {
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
      await apiClient.createJuniorProfile({ name: newName.trim(), currency: 'USD' })
      setNewName('')
      setShowAddForm(false)
      await loadProfiles()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add child')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Junior Smart Savings</h2>
              <p className="text-sm text-gray-600 mt-1">
                Parent-controlled accounts: goal-based saving, automated deposits, rewards.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium"
            >
              Add child
            </button>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Add a child</h3>
              <form onSubmit={handleAddChild} className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="child-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    id="child-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Child name"
                    className="rounded-md border border-gray-300 px-3 py-2 w-48"
                    required
                  />
                </div>
                <button type="submit" disabled={submitting} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add'}
                </button>
                <button type="button" onClick={() => { setShowAddForm(false); setError(null); }} className="px-4 py-2 rounded-md border border-gray-300">
                  Cancel
                </button>
              </form>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No children added yet. Add a child to start.</p>
              <button type="button" onClick={() => setShowAddForm(true)} className="mt-4 text-primary-600 font-medium">Add child</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((p) => (
                <Link key={p.id} href={`/junior/${p.id}`} className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-lg">
                      {p.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.name}</h3>
                      <p className="text-lg font-medium text-primary-600">{formatCurrency(p.balance ?? 0, p.currency ?? 'USD')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-3">View goals, deposits & rewards</p>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 p-6 bg-primary-50 rounded-xl border border-primary-100">
            <h3 className="font-semibold text-gray-900">Why Junior Smart Savings?</h3>
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              <li>Goal-based saving for habits from an early age</li>
              <li>Automated deposits (allowance) you control</li>
              <li>Progress tracking and rewards</li>
              <li>Parental governance: you approve goals and set amounts</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
