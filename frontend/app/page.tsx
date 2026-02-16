'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
              NX
            </div>
            <span className="font-semibold text-gray-900">Nexus</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Personal finance, simplified.
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Track accounts, transactions, budgets, and goals in one place. Nexus keeps your money in view.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Get started free
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl text-center">
          <div className="p-4">
            <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm mx-auto mb-3">
              NX
            </div>
            <h3 className="font-semibold text-gray-900">Accounts</h3>
            <p className="text-sm text-gray-600 mt-1">Connect checking, savings, and cards in one view.</p>
          </div>
          <div className="p-4">
            <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm mx-auto mb-3">
              NX
            </div>
            <h3 className="font-semibold text-gray-900">Budgets & goals</h3>
            <p className="text-sm text-gray-600 mt-1">Set limits and track progress toward savings goals.</p>
          </div>
          <div className="p-4">
            <div className="h-10 w-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm mx-auto mb-3">
              NX
            </div>
            <h3 className="font-semibold text-gray-900">Reports</h3>
            <p className="text-sm text-gray-600 mt-1">See where your money goes with clear charts.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          Nexus — Personal finance, simplified.
        </div>
      </footer>
    </div>
  )
}
