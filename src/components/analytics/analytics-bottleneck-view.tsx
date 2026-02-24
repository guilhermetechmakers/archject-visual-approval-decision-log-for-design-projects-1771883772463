/**
 * Bottleneck pipeline view - stages vs volume
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { BottleneckStage } from '@/types/analytics'

const STAGE_COLORS = [
  'rgb(var(--chart-destructive))',
  'rgb(var(--chart-warning))',
  'rgb(var(--chart-warning-muted))',
  'rgb(var(--chart-success))',
  'rgb(var(--chart-primary))',
]

export interface AnalyticsBottleneckViewProps {
  stages: BottleneckStage[]
  onStageClick?: (stage: string) => void
  className?: string
}

export function AnalyticsBottleneckView({
  stages,
  onStageClick,
  className,
}: AnalyticsBottleneckViewProps) {
  const isEmpty = stages.length === 0
  const data = stages.map((s, i) => ({
    ...s,
    fill: STAGE_COLORS[Math.min(i, STAGE_COLORS.length - 1)],
  }))

  return (
    <Card className={cn('rounded-2xl border border-border shadow-card', className)}>
      <CardHeader>
        <CardTitle>Bottleneck pipeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Decisions by stage — click to drill down
        </p>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground">No bottleneck data in this period</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try selecting a different date range
            </p>
          </div>
        ) : (
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 80, right: 24 }}
              onClick={(e) => {
                const payload = (e as { activePayload?: Array<{ payload: BottleneckStage }> })?.activePayload?.[0]
                if (payload) onStageClick?.(payload.payload.stage)
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} horizontal={false} />
              <XAxis type="number" className="text-xs" tick={{ fill: 'rgb(var(--chart-muted))' }} />
              <YAxis
                type="category"
                dataKey="stage"
                width={75}
                tick={{ fill: 'rgb(var(--chart-foreground))', fontSize: 12 }}
                tickFormatter={(v) => (v.length > 18 ? v.slice(0, 16) + '…' : v)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid rgb(var(--chart-border))',
                }}
                formatter={(value: unknown, _name: unknown, props: unknown) => [
                  `${Number(value ?? 0)} (${(props as { payload?: BottleneckStage })?.payload?.percentage ?? 0}%)`,
                  'Count',
                ]}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}
      </CardContent>
    </Card>
  )
}
