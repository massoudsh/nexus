'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { fa } from '@/lib/fa'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await apiClient.register(formData)
      // Auto-login after registration so users don't have to go through the sign-in page.
      await apiClient.login(formData.username, formData.password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || fa.auth.registrationFailed)
    } finally {
      setLoading(false)
    }
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
            {fa.auth.createYourAccount}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {fa.auth.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800 sm:text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {fa.auth.username}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800 sm:text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {fa.auth.fullName}
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800 sm:text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {fa.auth.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800 sm:text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-xl text-white bg-primary-500 hover:bg-primary-600 focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? fa.auth.creatingAccount : fa.auth.register}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm text-primary-600 hover:text-primary-500">
              {fa.auth.alreadyHaveAccount}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

