'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient, getApiErrorMessage } from '@/lib/api'
import { fa } from '@/lib/fa'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiClient.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                NX
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Nexus</span>
            </Link>
            <h2 className="text-center text-xl font-bold text-gray-900 dark:text-white">
              {fa.auth.checkYourEmail}
            </h2>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              {fa.auth.resetEmailMessage}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="text-center text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {fa.auth.backToSignIn}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100/80 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full space-y-8 p-8 card-elevated">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-11 w-11 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              NX
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">نکسوس</span>
          </Link>
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            {fa.auth.forgotPasswordTitle}
          </h2>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {fa.auth.enterEmailReset}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">
              {fa.auth.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 sm:text-sm"
              placeholder={fa.auth.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-xl text-white bg-primary-500 hover:bg-primary-600 focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50 transition-colors"
            >
              {loading ? fa.auth.sending : fa.auth.sendResetLink}
            </button>
          </div>
          <div className="text-center">
            <Link href="/login" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              {fa.auth.backToSignIn}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
