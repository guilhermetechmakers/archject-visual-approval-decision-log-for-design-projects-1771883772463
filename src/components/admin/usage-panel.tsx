/**
 * Usage & Requests Panel - traffic, API usage, rate limits.
 */

import { BarChart3, Zap, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiTile } from './kpi-tile'
import type { DashboardSummary } from '@/types/admin'
import { cn } from '@/lib/utils'

interface UsagePanelProps {
  data: DashboardSummary['usage']
  className?: string
}

export function UsagePanel({ data, className }: UsagePanelProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Usage & Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiTile
            label="Traffic (24h)"
            value={data.traffic_24h.toLocaleString()}
            icon={BarChart3}
          />
          <KpiTile
            label="API Usage"
            value={data.api_usage.toLocaleString()}
            icon={Zap}
          />
          <KpiTile
            label="Rate Limits Hit"
            value={data.rate_limits_hit}
            icon={AlertTriangle}
            variant={data.rate_limits_hit > 20 ? 'warning' : 'default'}
          />
          <KpiTile
            label="Pending Requests"
            value={data.pending_requests}
            icon={AlertTriangle}
          />
          <KpiTile
            label="Escalations"
            value={data.support_escalations}
            icon={AlertTriangle}
            variant={data.support_escalations > 3 ? 'destructive' : 'default'}
          />
        </div>
      </CardContent>
    </Card>
  )
}
