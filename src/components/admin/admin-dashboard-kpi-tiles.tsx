/**
 * Admin Dashboard KPI Tiles - active users, workspaces, API error rate, uptime, pending tickets.
 * Card-based metric tiles with design tokens and variant-aware styling.
 * Supports loading, error, and empty states.
 */

import {
  Users,
  Building2,
  AlertTriangle,
  Activity,
  Ticket,
  BarChart3,
  RefreshCw,
} from 'lucide-react'
import { KpiTile } from './kpi-tile'
import type { DashboardSummary } from '@/types/admin'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminDashboardKpiTilesProps {
  data?: DashboardSummary | null
  isLoading?: boolean
  error?: Error | string | null
  onRetry?: () => void
  className?: string
}

function KpiTileSkeleton() {
  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminDashboardKpiTiles({
  data,
  isLoading = false,
  error = null,
  onRetry,
  className,
}: AdminDashboardKpiTilesProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid gap-4 sm:grid-cols-2 lg:grid-cols-5',
          className
        )}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <KpiTileSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    const message = typeof error === 'string' ? error : error?.message ?? 'Failed to load metrics'
    return (
      <Card className={cn('border-destructive/30', className)}>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Unable to load KPI metrics</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className={cn('border-muted', className)}>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="rounded-full bg-muted p-3">
            <BarChart3 className="h-6 w-6 text-muted-foreground" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">No metrics available</p>
            <p className="text-sm text-muted-foreground">
              Dashboard summary data is not available yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeUsers = data.accounts.total_active_users ?? 0
  const activeWorkspaces = data.accounts.total_active_workspaces
  const apiErrors = data.system_health.errors_last_24h
  const uptime = data.system_health.uptime_pct
  const pendingTickets =
    (data.support_queue?.disputes_count ?? 0) +
    (data.support_queue?.billing_tickets ?? 0) +
    (data.usage?.support_escalations ?? 0)

  const errorVariant = apiErrors > 50 ? 'destructive' : apiErrors > 10 ? 'warning' : 'success'
  const uptimeVariant = uptime >= 99.9 ? 'success' : uptime >= 99 ? 'warning' : 'destructive'

  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2 lg:grid-cols-5',
        className
      )}
    >
      <KpiTile
        label="Active Users"
        value={activeUsers.toLocaleString()}
        icon={Users}
      />
      <KpiTile
        label="Active Workspaces"
        value={activeWorkspaces.toLocaleString()}
        icon={Building2}
      />
      <KpiTile
        label="API Errors (24h)"
        value={apiErrors}
        icon={AlertTriangle}
        variant={errorVariant}
      />
      <KpiTile
        label="System Uptime"
        value={`${uptime}%`}
        icon={Activity}
        variant={uptimeVariant}
      />
      <KpiTile
        label="Pending Support"
        value={pendingTickets}
        icon={Ticket}
        variant={pendingTickets > 5 ? 'warning' : 'default'}
      />
    </div>
  )
}
