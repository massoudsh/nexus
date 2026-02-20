'use client'

import { formatCurrency, formatNumber } from '@/lib/utils'
import type { BurnIntelligence as BurnType } from '@/lib/schemas/founder'
import { fa } from '@/lib/fa'

interface BurnIntelligenceProps {
  burn: BurnType
}

export function BurnIntelligence({ burn }: BurnIntelligenceProps) {
  const f = burn.runway_forecast
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/80 p-5">
      <h3 className="text-base font-semibold text-white mb-4">{fa.dashboard.burnIntelligence}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <p className="text-xs text-gray-400">{fa.dashboard.grossBurn30d}</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(burn.gross_burn_30d)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">{fa.dashboard.netBurn30d}</p>
          <p className="text-sm font-semibold text-red-400">{formatCurrency(burn.net_burn_30d)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">{fa.dashboard.burnMultiple}</p>
          <p className="text-sm font-semibold text-white">{burn.burn_multiple != null ? `${formatNumber(burn.burn_multiple)}x` : '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">{fa.dashboard.avgBurn3m}</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(burn.avg_burn_3m)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">{fa.dashboard.runwayCurrent}</p>
          <p className="text-sm font-semibold text-white">{burn.runway_months != null ? `${formatNumber(Math.floor(burn.runway_months))} ${fa.dashboard.months}` : '∞'}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">{fa.dashboard.forecast}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
          <span><strong className="text-white">{fa.dashboard.base}:</strong> {f.base_months != null ? `${formatNumber(Math.round(f.base_months))} ${fa.dashboard.months}` : '—'}</span>
          <span><strong className="text-white">{fa.dashboard.conservative}:</strong> {f.conservative_months != null ? `${formatNumber(Math.round(f.conservative_months))} ${fa.dashboard.months}` : '—'}</span>
          <span><strong className="text-white">{fa.dashboard.aggressive}:</strong> {f.aggressive_months != null ? `${formatNumber(Math.round(f.aggressive_months))} ${fa.dashboard.months}` : '—'}</span>
        </div>
      </div>
    </div>
  )
}
