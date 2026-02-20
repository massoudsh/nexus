'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { SparklineMonth } from '@/lib/schemas/founder'
import { formatCurrency } from '@/lib/utils'

interface NetBurnCashChartExactProps {
  data: SparklineMonth[]
  cashBalance: number
}

export default function NetBurnCashChartExact({ data, cashBalance }: NetBurnCashChartExactProps) {
  const series = data.map((d, i) => {
    let runningCash = cashBalance
    for (let j = data.length - 1; j > i; j--) {
      runningCash -= data[j].net
    }
    const isLast = i === data.length - 1
    return {
      name: d.label,
      netBurn: -d.net_burn,
      cashBalance: runningCash,
      net: d.net,
      isProjected: isLast,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `(${new Intl.NumberFormat('fa-IR').format(Math.abs(v) / 1000)}ه)`} />
        <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(v / 1e6)}م`} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#fff' }}
          formatter={(value: number, name: string) => [name === 'cashBalance' ? formatCurrency(value) : formatCurrency(Math.abs(value)), name]}
          labelFormatter={(label) => label}
        />
        <Legend wrapperStyle={{ paddingTop: 8 }} formatter={(value) => <span className="text-gray-300 text-sm">{value}</span>} />
        <Bar
          yAxisId="left"
          dataKey="netBurn"
          name="Net burn"
          fill="#eab308"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cashBalance"
          name="Cash balance"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 4, fill: '#22c55e' }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
