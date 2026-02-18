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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('nexus-theme');var r=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.add(r?'dark':'light');})();`,
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <ClientProviders>{children}</ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  )
}

