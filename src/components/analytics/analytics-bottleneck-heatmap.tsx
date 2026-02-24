/**
 * Bottleneck heatmap - stage-by-stage average response time
  */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { BottleneckStage } from '@/types/analytics'

export interface AnalyticsBottleneckHeatmapProps {
  stages: BottleneckStage[]
  onStageClick?: (stage: string) => void
  className?: string
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

function getHeatColor(avgHours: number, maxHours: number): string {
  if (maxHours <= 0) return 'rgb(var(--chart-success))'
  const ratio = avgHours / maxHours
  if (ratio <= 0.25) return 'rgb(var(--chart-success))'
  if (ratio <= 0.5) return 'rgb(var(--chart-warning-muted))'
  if (ratio <= 0.75) return 'rgb(var(--chart-warning))'
  return 'rgb(var(--chart-destructive))'
}

export function AnalyticsBottleneckHeatmap({
  stages,
  onStageClick,
  className,
}: AnalyticsBottleneckHeatmapProps) {
  const stagesWithHours = stages.filter(
    (s) => s.avgResponseTimeHours != null && s.avgResponseTimeHours > 0
  )
  const maxHours = Math.max(
    ...stagesWithHours.map((s) => s.avgResponseTimeHours ?? 0),
    1
  )

  return (
    <Card className={cn('rounded-2xl border border-border shadow-card', className)}>
      <CardHeader>
        <CardTitle>Bottleneck heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">
          Stage-by-stage average response time — darker = slower
        </p>
      </CardHeader>
      <CardContent>
        {stagesWithHours.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground">No response time data available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try selecting a different date range
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {stagesWithHours.map((s) => {
              const hours = s.avgResponseTimeHours ?? 0
              const bg = getHeatColor(hours, maxHours)
              return (
                <button
                  key={s.stage}
                  type="button"
                  onClick={() => onStageClick?.(s.stage)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all',
                    'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                    onStageClick && 'cursor-pointer'
                  )}
                  style={{ backgroundColor: `${bg}40`, borderLeft: `4px solid ${bg}` }}
                  aria-label={`${s.stage}: ${formatHours(hours)} avg`}
                >
                  <span className="font-medium text-foreground truncate max-w-[70%]">
                    {s.stage}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground shrink-0">
                    {formatHours(hours)} avg
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
