'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function ConnectBankPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main id="main-content" className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Link bank account</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Connect your bank to automatically import transactions. This feature is coming soon.
        </p>
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            We are evaluating open banking providers (e.g. Plaid, Yodlee) for your region. You can still add accounts manually and use Banking to paste SMS or notifications.
          </p>
          <Link
            href="/accounts"
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
          >
            Add account manually
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/dashboard" className="text-primary-600 dark:text-primary-400 hover:underline">
            Back to dashboard
          </Link>
        </p>
      </main>
    </div>
  )
}
