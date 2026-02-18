'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthed, setIsAuthed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = useMemo(
    () => [
      { href: '/dashboard', label: 'Overview' },
      { href: '/accounts', label: 'Accounts' },
      { href: '/transactions', label: 'Transactions' },
      { href: '/budgets', label: 'Budgets' },
      { href: '/goals', label: 'Goals' },
      { href: '/banking-messages', label: 'Banking' },
      { href: '/junior', label: 'Junior Savings' },
    ],
    []
  )

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsAuthed(Boolean(token))
  }, [pathname])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setIsAuthed(false)
    setMobileMenuOpen(false)
    router.replace('/dashboard')
  }

  return (
    <nav className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                NX
              </div>
              <div className="font-semibold text-gray-900">Nexus</div>
              {!isAuthed && (
                <span className="ml-1 text-xs font-medium bg-yellow-50 text-yellow-800 border border-yellow-200 px-2 py-0.5 rounded-full hidden sm:inline">
                  Guest
                </span>
              )}
            </Link>

            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'px-3 py-2 rounded-md text-sm font-medium',
                      active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              {isAuthed ? (
                <>
                  <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
                    Settings
                  </Link>
                  <Button variant="secondary" onClick={handleLogout}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                    Sign in
                  </Link>
                  <Link href="/register">
                    <Button>Create account</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'px-3 py-2 rounded-md text-sm font-medium',
                      active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1">
                {isAuthed ? (
                  <>
                    <Link href="/settings" className="px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-md text-sm font-medium text-left text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Sign in
                    </Link>
                    <Link href="/register" className="px-3 py-2 rounded-md text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 text-center">
                      Create account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

