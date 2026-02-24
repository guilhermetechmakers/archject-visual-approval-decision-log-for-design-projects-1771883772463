/**
 * Time-series trend chart for approvals
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { TimeSeriesPoint } from '@/types/analytics'

export interface AnalyticsTrendChartProps {
  data: TimeSeriesPoint[]
  className?: string
}

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function AnalyticsTrendChart({ data, className }: AnalyticsTrendChartProps) {
  const chartData = data.map((p) => ({
    ...p,
    name: formatAxisDate(p.date),
  }))

  const isEmpty = chartData.length === 0

  return (
    <Card className={cn('rounded-2xl border border-border shadow-card', className)}>
      <CardHeader>
        <CardTitle>Approvals over time</CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily approval and pending trends
        </p>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground">No approval data in this period</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try selecting a different date range
            </p>
          </div>
        ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="approvalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--chart-primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(var(--chart-primary))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: 'rgb(var(--chart-muted))' }} />
              <YAxis className="text-xs" tick={{ fill: 'rgb(var(--chart-muted))' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid rgb(var(--chart-border))',
                }}
                formatter={(value: number | undefined) => [value ?? 0, '']}
                labelFormatter={(label) => label}
              />
              <Area
                type="monotone"
                dataKey="approvals"
                stroke="rgb(var(--chart-primary))"
                fill="url(#approvalGradient)"
                strokeWidth={2}
                name="Approvals"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
