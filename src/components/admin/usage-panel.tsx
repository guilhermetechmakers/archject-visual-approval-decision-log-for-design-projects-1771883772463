/**
 * Usage & Requests Panel - traffic, API usage, rate limits.
 * Uses design tokens, consistent icon sizing, and accessible KPI tiles.
 */

import { BarChart3, Zap, AlertTriangle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiTile } from './kpi-tile'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { DashboardSummary } from '@/types/admin'
import { cn } from '@/lib/utils'

const ICON_SIZE = 'h-5 w-5'

interface UsagePanelProps {
  data?: DashboardSummary['usage'] | null
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  className?: string
}

function UsageEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center"
      role="status"
      aria-label="No usage data available"
    >
      <BarChart3 className={cn(ICON_SIZE, 'mb-3 text-muted-foreground')} aria-hidden />
      <p className="text-sm font-medium text-foreground">No usage data yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Usage metrics will appear here once traffic and API requests are recorded.
      </p>
    </div>
  )
}

function UsageErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-12 text-center"
      role="alert"
      aria-label="Failed to load usage data"
    >
      <AlertTriangle className={cn(ICON_SIZE, 'mb-3 text-destructive')} aria-hidden />
      <p className="text-sm font-medium text-foreground">Failed to load usage data</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Please try again or contact support if the problem persists.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}

function UsageLoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  )
}

export function UsagePanel({
  data,
  isLoading = false,
  error = null,
  onRetry,
  className,
}: UsagePanelProps) {
  const isEmpty =
    !data ||
    (data.traffic_24h === 0 &&
      data.api_usage === 0 &&
      data.rate_limits_hit === 0 &&
      data.pending_requests === 0 &&
      data.support_escalations === 0)

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className={cn(ICON_SIZE, 'text-primary')} aria-hidden />
            Usage & Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsageLoadingSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className={cn(ICON_SIZE, 'text-primary')} aria-hidden />
            Usage & Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsageErrorState onRetry={onRetry} />
        </CardContent>
      </Card>
    )
  }

  if (isEmpty) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className={cn(ICON_SIZE, 'text-primary')} aria-hidden />
            Usage & Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsageEmptyState />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className={cn(ICON_SIZE, 'text-primary')} aria-hidden />
          Usage & Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiTile
            label="Traffic (24h)"
            value={data!.traffic_24h.toLocaleString()}
            icon={BarChart3}
            ariaLabel={`Traffic in last 24 hours: ${data!.traffic_24h.toLocaleString()} requests`}
          />
          <KpiTile
            label="API Usage"
            value={data!.api_usage.toLocaleString()}
            icon={Zap}
            ariaLabel={`API usage: ${data!.api_usage.toLocaleString()} calls`}
          />
          <KpiTile
            label="Rate Limits Hit"
            value={data!.rate_limits_hit}
            icon={AlertTriangle}
            variant={data!.rate_limits_hit > 20 ? 'warning' : 'default'}
            ariaLabel={`Rate limits hit: ${data!.rate_limits_hit}${data!.rate_limits_hit > 20 ? ', above threshold' : ''}`}
          />
          <KpiTile
            label="Pending Requests"
            value={data!.pending_requests}
            icon={Clock}
            ariaLabel={`Pending requests: ${data!.pending_requests}`}
          />
          <KpiTile
            label="Escalations"
            value={data!.support_escalations}
            icon={AlertCircle}
            variant={data!.support_escalations > 3 ? 'destructive' : 'default'}
            ariaLabel={`Support escalations: ${data!.support_escalations}${data!.support_escalations > 3 ? ', requires attention' : ''}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}
