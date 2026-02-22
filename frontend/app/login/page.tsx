'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { fa } from '@/lib/fa'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'password' | '2fa'>('password')
  const [tempToken, setTempToken] = useState('')
  const [code, setCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (step === 'password') {
        const result = await apiClient.login(username, password)
        if ('requires_2fa' in result && result.requires_2fa) {
          setTempToken(result.temp_token)
          setStep('2fa')
        } else {
          router.push('/dashboard')
        }
      } else {
        await apiClient.verify2faLogin(tempToken, code)
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || fa.auth.loginFailed)
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
            {fa.auth.signInToNexus}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          {step === '2fa' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">{fa.auth.enter2faCode}</p>
              <div>
                <label htmlFor="code" className="sr-only">{fa.auth.twoFactorCode}</label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="۰۰۰۰۰۰"
                  className="relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800 sm:text-sm text-center tracking-widest focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <button type="button" onClick={() => { setStep('password'); setCode(''); setTempToken(''); setError(''); }} className="text-sm text-primary-600 hover:text-primary-500">
                {fa.common.cancel}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="sr-only">{fa.auth.username}</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800 sm:text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    placeholder={fa.auth.username}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">{fa.auth.password}</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl placeholder-gray-500 text-gray-900 dark:text-gray-100 dark:bg-gray-800 sm:text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    placeholder={fa.auth.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-500">
                  {fa.auth.forgotPassword}
                </Link>
              </div>
              <div className="text-center">
                <Link href="/register" className="text-sm text-primary-600 hover:text-primary-500">
                  {fa.auth.dontHaveAccount}
                </Link>
              </div>
            </>
          )}
          <div>
            <button
              type="submit"
              disabled={loading || (step === '2fa' && code.length !== 6)}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-xl text-white bg-primary-500 hover:bg-primary-600 focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {step === '2fa' ? (loading ? fa.auth.signingIn : fa.auth.verify) : (loading ? fa.auth.signingIn : fa.common.signIn)}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

