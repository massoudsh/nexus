'use client'

import { useState } from 'react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { FounderKpis } from '@/lib/schemas/founder'
import { fa } from '@/lib/fa'

interface KpiStripProps {
  kpis: FounderKpis
  onDrillDown?: (key: string) => void
}

const KPI_CONFIG: Record<
  keyof FounderKpis,
  { label: string; format: 'currency' | 'number' | 'percent' | 'months'; suffix?: string }
> = {
  cash_balance: { label: "Today's Balance", format: 'currency' },
  monthly_burn: { label: 'Operating Burn', format: 'currency', suffix: ' (net)' },
  runway_months: { label: 'Runway', format: 'months' },
  mrr: { label: 'MRR', format: 'currency' },
  arr: { label: 'ARR', format: 'currency' },
  revenue_growth_pct: { label: 'Revenue Growth', format: 'percent' },
  cash_in_30d: { label: 'Cash In (30d)', format: 'currency' },
  cash_out_30d: { label: 'Cash Out (30d)', format: 'currency' },
}

function formatValue(
  key: keyof FounderKpis,
  value: number | null
): string {
  const cfg = KPI_CONFIG[key]
  if (value === null || (typeof value === 'number' && Number.isNaN(value)))
    return '—'
  if (cfg.format === 'currency') {
    const n = Number(value)
    if (key === 'monthly_burn' && n > 0) return `(${formatCurrency(n)})`
    return formatCurrency(n)
  }
  if (cfg.format === 'percent') return `${formatNumber(Number(value), { maximumFractionDigits: 1, minimumFractionDigits: 1 })}٪`
  if (cfg.format === 'months') return `${formatNumber(Math.round(Number(value)))} م`
  return String(value)
}

function MiniSparkline({ data }: { data: number[] }) {
  if (!data.length) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const h = 24
  const w = 64
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1 || 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} className="text-primary-500" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  )
}

export function KpiStrip({ kpis, onDrillDown }: KpiStripProps) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const keys = Object.keys(KPI_CONFIG) as (keyof FounderKpis)[]

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {keys.map((key) => {
          const k = kpis[key]
          const cfg = KPI_CONFIG[key]
          const value = k?.value ?? null
          const trend = k?.trend ?? 'neutral'
          const sparkline = k?.sparkline ?? []
          const click = () => {
            setOpenKey(key)
            onDrillDown?.(key)
          }
          return (
            <button
              key={key}
              type="button"
              onClick={click}
              className="text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                  {cfg.label}
                </span>
                <span className="text-gray-400 dark:text-gray-500" aria-hidden>
                  {trend === 'up' && '↑'}
                  {trend === 'down' && '↓'}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {key === 'runway_months' && value != null && !Number.isNaN(Number(value))
                  ? `${formatNumber(Math.floor(Number(value)))} ${fa.dashboard.months}`
                  : formatValue(key, value)}
              </p>
              <div className="mt-2 flex justify-end">
                <MiniSparkline data={sparkline} />
              </div>
            </button>
          )
        })}
      </div>

      {openKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setOpenKey(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="drilldown-title"
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="drilldown-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {KPI_CONFIG[openKey as keyof FounderKpis]?.label ?? openKey}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Detailed breakdown and history for this metric. Link to Reports and Transactions coming next.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpenKey(null)}
                className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
