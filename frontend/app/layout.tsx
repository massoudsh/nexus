import type { Metadata } from 'next'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ClientProviders } from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: { default: 'Nexus', template: '%s | Nexus' },
  description: 'Personal finance, simplified. Track accounts, transactions, budgets, and goals in one place.',
  applicationName: 'Nexus',
  openGraph: {
    title: 'Nexus — Personal finance, simplified',
    description: 'Track accounts, transactions, budgets, and goals in one place.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ClientProviders>{children}</ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  )
}

