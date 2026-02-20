'use client'

import { useState } from 'react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { FounderKpis } from '@/lib/schemas/founder'
import { addMonths, format } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { fa } from '@/lib/fa'

interface KpiStripExactProps {
  kpis: FounderKpis
}

export function KpiStripExact({ kpis }: KpiStripExactProps) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const cashVal = kpis.cash_balance?.value ?? 0
  const burnVal = kpis.monthly_burn?.value ?? 0
  const runwayMonths = kpis.runway_months?.value
  const runwayEndDate = runwayMonths != null && runwayMonths > 0 ? addMonths(new Date(), Math.floor(runwayMonths)) : null
  const runwayLabel = runwayEndDate ? `${format(runwayEndDate, 'MMM yyyy', { locale: faIR })} (${formatNumber(Math.floor(runwayMonths!))} ${fa.dashboard.months})` : '—'

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setOpenKey('balance')}
          className="text-left rounded-xl border border-gray-700 bg-gray-800/80 dark:bg-gray-800/80 p-5 hover:bg-gray-700/50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-gray-300">{fa.dashboard.todayBalance}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 hover:text-gray-400" aria-label="Toggle visibility">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </span>
              <span className="text-gray-500" aria-hidden><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
            </div>
          </div>
          <p className="text-2xl font-semibold text-white">{formatCurrency(cashVal)}</p>
        </button>

        <button
          type="button"
          onClick={() => setOpenKey('burn')}
          className="text-left rounded-xl border border-gray-700 bg-gray-800/80 dark:bg-gray-800/80 p-5 hover:bg-gray-700/50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-gray-300">{fa.dashboard.operatingBurn}</span>
            <span className="text-gray-500" aria-hidden><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
          </div>
          <p className="text-2xl font-semibold text-amber-400">{burnVal > 0 ? `(${formatCurrency(burnVal)})` : formatCurrency(0)}</p>
        </button>

        <button
          type="button"
          onClick={() => setOpenKey('runway')}
          className="text-left rounded-xl border border-gray-700 bg-gray-800/80 dark:bg-gray-800/80 p-5 hover:bg-gray-700/50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-medium text-gray-300">{fa.dashboard.runwayRunRate}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 hover:text-gray-400" aria-label="Help"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
              <span className="text-gray-500" aria-hidden><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></span>
            </div>
          </div>
          <p className="text-2xl font-semibold text-white">{runwayLabel}</p>
        </button>
      </div>

      {openKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpenKey(null)} role="dialog" aria-modal="true">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6 border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-2">{openKey === 'balance' ? fa.dashboard.todayBalance : openKey === 'burn' ? fa.dashboard.operatingBurn : fa.dashboard.runwayRunRate}</h2>
            <p className="text-sm text-gray-400 mb-4">{fa.dashboard.drillDown}</p>
            <button type="button" onClick={() => setOpenKey(null)} className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 text-sm font-medium">{fa.common.close}</button>
          </div>
        </div>
      )}
    </>
  )
}
