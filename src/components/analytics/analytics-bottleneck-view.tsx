/**
 * Bottleneck pipeline view - stages vs volume
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { BottleneckStage } from '@/types/analytics'

const STAGE_COLORS = [
  'rgb(255, 108, 108)', // destructive - high bottleneck
  'rgb(255, 232, 163)', // warning
  'rgb(255, 220, 168)', // muted warning
  'rgb(123, 228, 149)', // success - low
  'rgb(25, 92, 74)',   // primary
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
              <XAxis type="number" className="text-xs" tick={{ fill: 'rgb(107, 114, 128)' }} />
              <YAxis
                type="category"
                dataKey="stage"
                width={75}
                tick={{ fill: 'rgb(35, 39, 47)', fontSize: 12 }}
                tickFormatter={(v) => (v.length > 18 ? v.slice(0, 16) + '…' : v)}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid rgb(230, 232, 240)',
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
      </CardContent>
    </Card>
  )
}
