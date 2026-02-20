'use client'

import Link from 'next/link'
import { fa } from '@/lib/fa'
import { formatCurrency } from '@/lib/utils'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-white flex flex-col overflow-hidden">
      <header className="border-b border-white/5 bg-[#0f0f14]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-sm text-[#0f0f14]">
              NX
            </div>
            <span className="font-semibold text-white">نکسوس</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition">
              {fa.common.signIn}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-[#0f0f14] bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              {fa.common.createAccount}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-20">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
            <svg className="absolute top-20 right-20 w-full max-w-2xl h-auto opacity-20" viewBox="0 0 400 200" fill="none">
              {[...Array(12)].map((_, i) => (
                <line key={i} x1={i * 40} y1={0} x2={i * 40} y2={200} stroke="url(#grid)" strokeWidth="0.5" />
              ))}
              {[...Array(6)].map((_, i) => (
                <line key={i} x1={0} y1={i * 40} x2={400} y2={i * 40} stroke="url(#grid)" strokeWidth="0.5" />
              ))}
              <defs>
                <linearGradient id="grid" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#22c55e" stopOpacity="0.3" /><stop offset="1" stopColor="#8b5cf6" stopOpacity="0.2" /></linearGradient>
              </defs>
            </svg>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[480px]">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-xl">
                <span className="text-emerald-400">{fa.landing.smartAccounting}</span>
                <br />
                <span className="text-white">{fa.landing.forStartups}</span>
              </h1>
              <p className="mt-6 text-lg text-gray-400 max-w-md">
                {fa.landing.tagline}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium text-[#0f0f14] bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                >
                  {fa.landing.getStartedFree}
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-base font-medium text-white border border-gray-600 hover:border-gray-500 hover:bg-white/5 transition"
                >
                  {fa.landing.goToDashboard}
                </Link>
              </div>
            </div>

            {/* Right: illustration — ledger book + digital panel + magnifying glass + platform */}
            <div className="relative hidden lg:block h-[380px] flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[320px] h-[280px]">
                  {/* Glowing base platform */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-16 rounded-lg bg-gray-800/90 border border-emerald-500/30 shadow-[0_0_40px_rgba(34,197,94,0.15)]" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-emerald-400/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    NX
                  </div>
                  {/* Vertical light lines from platform */}
                  <div className="absolute bottom-16 left-1/2 -translate-x-px w-px h-24 bg-gradient-to-t from-emerald-400/40 to-transparent" />
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

                  {/* Open book / ledger */}
                  <div className="absolute top-4 left-8 w-36 h-44 rounded-sm bg-gray-700/80 border border-emerald-500/20 shadow-lg transform -rotate-[-8deg]">
                    <div className="absolute inset-1 rounded bg-gray-800/60" />
                    <div className="absolute top-2 left-2 right-2 h-3 bg-gray-600/60 rounded" />
                    <div className="absolute top-7 left-2 right-2 space-y-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-2 bg-gray-600/40 rounded w-full" style={{ width: `${70 + i * 10}%` }} />
                      ))}
                    </div>
                    <div className="absolute top-2 right-3 text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider">دفتر کل</div>
                  </div>

                  {/* Digital UI panel */}
                  <div className="absolute top-12 right-4 w-40 h-32 rounded-lg bg-gray-800/90 border border-gray-600 shadow-xl transform rotate-[6deg]">
                    <div className="p-2">
                      <div className="w-5 h-5 rounded bg-gray-600/60 mb-2" />
                      <div className="space-y-1.5">
                        {[90, 70, 85, 60].map((w, i) => (
                          <div key={i} className="h-2 bg-gray-600/50 rounded" style={{ width: `${w}%` }} />
                        ))}
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-1">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="h-4 bg-gray-600/40 rounded" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Magnifying glass with purple rim */}
                  <div className="absolute top-20 right-16 w-20 h-20 rounded-full border-4 border-violet-400/80 shadow-[0_0_20px_rgba(139,92,246,0.4)] transform rotate-12">
                    <div className="absolute inset-2 rounded-full bg-gray-900/40 border border-violet-400/30" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/40" />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1 h-8 bg-violet-400/60 rounded-full transform -rotate-12" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
          <h2 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl">
            {fa.dashboard.titleBeforeRealtime}<span className="text-emerald-400">{fa.dashboard.realtime}</span>{fa.dashboard.titleAfterRealtime}
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl">
            {fa.landing.founderKpis}
          </p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{fa.dashboard.todayBalance}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(1515023)}</p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{fa.dashboard.operatingBurn}</p>
              <p className="mt-2 text-2xl font-semibold text-amber-400">({formatCurrency(10650)})</p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{fa.dashboard.runwayRunRate}</p>
              <p className="mt-2 text-2xl font-semibold text-white">۱۹ {fa.dashboard.months}</p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{fa.dashboard.mrr}</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-400">{formatCurrency(42000)}</p>
            </div>
          </div>
          <Link href="/dashboard" className="mt-8 inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-[#0f0f14] bg-emerald-400 hover:bg-emerald-300 transition">
            {fa.landing.openDashboard}
          </Link>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
          <h2 className="text-3xl font-bold text-white">
            {fa.investors.titleBefore}<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{fa.investors.titleHighlight}</span>{fa.investors.titleAfter}
          </h2>
          <p className="mt-4 text-gray-400">
            {fa.landing.compositionExport}
          </p>
          <Link href="/investors" className="mt-6 inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white border border-gray-600 hover:bg-white/5 transition">
            {fa.investors.viewReport}
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          {fa.landing.footer}
        </div>
      </footer>
    </div>
  )
}
