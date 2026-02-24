/**
 * Dashboard trend cards - 7/30/90-day trend lines for decisions created,
 * responses, and templates used
 */

import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DashboardTrendData } from '@/types/dashboard'

export interface DashboardTrendCardsProps {
  trendData: DashboardTrendData
  className?: string
}

const PERIOD_LABELS = {
  last7Days: '7 days',
  last30Days: '30 days',
  last90Days: '90 days',
} as const

export function DashboardTrendCards({ trendData, className }: DashboardTrendCardsProps) {
  const periods = (['last7Days', 'last30Days', 'last90Days'] as const).map((key) => ({
    key,
    label: PERIOD_LABELS[key],
    data: trendData[key],
  }))

  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-lg font-semibold text-foreground">Trends</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {periods.map(({ key, label, data }) => (
          <Card
            key={key}
            className="rounded-xl border border-border bg-card transition-all duration-200 hover:shadow-card-hover"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Last {label}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" aria-hidden />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-foreground">{data.decisionsCreated}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Responded</span>
                <span className="font-medium text-foreground">{data.decisionsResponded}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Templates used</span>
                <span className="font-medium text-foreground">{data.templatesUsed}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
