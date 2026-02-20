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

interface NetBurnCashChartProps {
  data: SparklineMonth[]
  cashBalance: number
}

export default function NetBurnCashChart({ data, cashBalance }: NetBurnCashChartProps) {
  const series = data.map((d, i) => {
    let runningCash = cashBalance
    for (let j = data.length - 1; j > i; j--) {
      runningCash -= data[j].net
    }
    return {
      name: d.label,
      netBurn: d.net_burn,
      cashBalance: runningCash,
      net: d.net,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={series}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis dataKey="name" className="text-xs" />
        <YAxis yAxisId="left" tickFormatter={(v) => `${new Intl.NumberFormat('fa-IR').format(v / 1000)}ه`} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(v / 1e6)}م`} />
        <Tooltip
          formatter={(value: number, name: string) =>
            name === 'cashBalance' ? formatCurrency(value) : formatCurrency(value)
          }
          labelFormatter={(label) => label}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="netBurn"
          name="Net burn"
          fill="#eab308"
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cashBalance"
          name="Cash balance"
          stroke="#16a34a"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
