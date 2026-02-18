'use client'

import { useEffect, useState } from 'react'
import { apiClient, getApiErrorMessage } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { useTheme, type Theme } from '@/contexts/ThemeContext'
import { useToast } from '@/contexts/ToastContext'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { addToast } = useToast()
  const [user, setUser] = useState<{ email?: string; username?: string; full_name?: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState({ email: '', username: '', full_name: '' })

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email ?? '',
        username: user.username ?? '',
        full_name: user.full_name ?? '',
      })
    }
  }, [user])

  const loadUser = async () => {
    try {
      const data = await apiClient.getCurrentUser()
      setUser(data)
    } catch (error) {
      console.error('Failed to load user:', error)
      const status = (error as any)?.response?.status
      if (status === 401) setIsGuest(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setSaving(true)
    try {
      const updated = await apiClient.updateProfile({
        email: form.email || undefined,
        username: form.username || undefined,
        full_name: form.full_name || undefined,
      })
      setUser(updated)
      setEditing(false)
      setMessage({ type: 'success', text: 'Profile updated.' })
      addToast('success', 'Profile updated.')
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.replace('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>
          ) : isGuest ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Guest Mode</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create an account to manage profile settings.
              </p>
              <div className="mt-6">
                <Link
                  href="/register"
                  className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm font-medium"
                >
                  Create account
                </Link>
              </div>
            </div>
          ) : user ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile</h3>
                {message && (
                  <div
                    className={`mb-4 px-4 py-3 rounded-md text-sm ${
                      message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {message.text}
                  </div>
                )}
                {editing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        required
                        minLength={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={form.username}
                        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full name
                      </label>
                      <input
                        id="full_name"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={form.full_name}
                        onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm font-medium"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditing(false); setForm({ email: user.email ?? '', username: user.username ?? '', full_name: user.full_name ?? '' }); }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.username}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full name</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.full_name || '—'}</dd>
                      </div>
                    </dl>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                      >
                        Edit profile
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Appearance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose light, dark, or system.</p>
                <div className="flex gap-2">
                  {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                        theme === t
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">Failed to load user information</div>
          )}
        </div>
      </main>
    </div>
  )
}
