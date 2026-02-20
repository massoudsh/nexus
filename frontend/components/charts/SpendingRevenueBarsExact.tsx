'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import type { SparklineMonth } from '@/lib/schemas/founder'

interface SpendingRevenueBarsExactProps {
  data: SparklineMonth[]
  type: 'spending' | 'revenue'
}

export function SpendingBarsExact({ data }: { data: SparklineMonth[] }) {
  const chartData = data.map((d, i) => ({ name: d.label.replace(/'\d{2}/, ''), value: d.expenses, isProjected: i === data.length - 1 }))
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 2" stroke="#374151" />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `${new Intl.NumberFormat('fa-IR').format(v / 1000)}ه`} />
        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 6 }} labelStyle={{ color: '#fff' }} />
        <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function RevenueBarsExact({ data }: { data: SparklineMonth[] }) {
  const chartData = data.map((d, i) => ({ name: d.label.replace(/'\d{2}/, ''), value: d.income, isProjected: i === data.length - 1 }))
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 2" stroke="#374151" />
        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `${new Intl.NumberFormat('fa-IR').format(v / 1000)}ه`} />
        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 6 }} labelStyle={{ color: '#fff' }} />
        <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
