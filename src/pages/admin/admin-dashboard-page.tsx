/**
 * Admin Dashboard - overview with accounts, health, support, usage, alerts, escalations.
 * Uses design tokens, accessible controls, and distinct loading/error states.
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  AccountsOverviewCard,
  SystemHealthPanel,
  SupportQueuePanel,
  UsagePanel,
  QuickActionsRail,
  AlertsPanel,
  RecentEscalationsPanel,
  TopTenantsPanel,
  SecurityEventsPanel,
  AdminDashboardKpiTiles,
  DashboardFilters,
} from '@/components/admin'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAdminDashboardSummary } from '@/hooks/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Calendar, AlertTriangle, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminDashboardFilters } from '@/api/admin'

const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
] as const

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in" role="status" aria-label="Loading admin dashboard">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-9 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[160px] rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <QuickActionsRail />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  )
}

function DashboardErrorState({
  error,
  onRetry,
  isRetrying,
}: {
  error: Error | null
  onRetry: () => void
  isRetrying: boolean
}) {
  const message = error?.message ?? 'Failed to load dashboard data. Please check your connection and try again.'

  return (
    <div className="space-y-6 animate-fade-in" role="alert" aria-live="assertive">
      <Alert
        variant="destructive"
        className="border-destructive/50 bg-destructive/10 shadow-card"
      >
        <AlertTriangle className="h-5 w-5" aria-hidden />
        <AlertTitle className="text-base font-semibold text-destructive">
          Unable to load dashboard
        </AlertTitle>
        <AlertDescription className="mt-2 text-sm text-foreground/90">
          {message}
        </AlertDescription>
      </Alert>
      <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card p-8 shadow-card sm:flex-row sm:gap-4">
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <LayoutDashboard className="h-6 w-6 text-destructive" aria-hidden />
          </div>
          <div>
            <p className="font-medium text-foreground">Dashboard unavailable</p>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load your dashboard. Try refreshing or contact support if the problem persists.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={onRetry}
          disabled={isRetrying}
          aria-label={isRetrying ? 'Refreshing dashboard' : 'Retry loading dashboard'}
        >
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Refreshing…
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
              Retry
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const [dateRange, setDateRange] = React.useState<AdminDashboardFilters['range']>('30d')
  const [filters, setFilters] = React.useState({
    dateRange: '30d',
    region: 'all',
    accountTier: 'all',
  })
  const { data, isLoading, error, refetch, isFetching } = useAdminDashboardSummary({ range: dateRange })

  if (isLoading) {
    return <DashboardLoadingSkeleton />
  }

  if (error || !data) {
    return (
      <DashboardErrorState
        error={error instanceof Error ? error : null}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={dateRange}
            onValueChange={(v) => setDateRange(v as AdminDashboardFilters['range'])}
          >
            <SelectTrigger
              className="w-[160px] rounded-full bg-[rgb(var(--input))]"
              aria-label="Date range for dashboard metrics"
            >
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label={isFetching ? 'Refreshing dashboard data' : 'Refresh dashboard data'}
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')}
              aria-hidden
            />
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      <QuickActionsRail />

      <DashboardFilters filters={filters} onFiltersChange={setFilters} />

      <AdminDashboardKpiTiles data={data} />

      {data.alerts && data.alerts.length > 0 && (
        <AlertsPanel alerts={data.alerts} />
      )}

      <AccountsOverviewCard data={data.accounts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SystemHealthPanel data={data.system_health} />
        <SupportQueuePanel summary={data.support_queue} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SecurityEventsPanel defaultExpanded />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UsagePanel data={data.usage} />
        <div className="space-y-6">
          <RecentEscalationsPanel escalations={data.recent_escalations ?? []} />
          <TopTenantsPanel topTenants={data.top_tenants ?? []} />
        </div>
      </div>
    </div>
  )
}
