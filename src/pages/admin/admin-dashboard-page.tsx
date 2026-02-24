/**
 * Admin Dashboard - overview with accounts, health, support, usage, alerts, escalations.
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
import { useAdminDashboardSummary } from '@/hooks/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Calendar } from 'lucide-react'
import type { AdminDashboardFilters } from '@/api/admin'

const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
] as const

export function AdminDashboardPage() {
  const [dateRange, setDateRange] = React.useState<AdminDashboardFilters['range']>('30d')
  const [filters, setFilters] = React.useState({
    dateRange: '30d',
    region: 'all',
    accountTier: 'all',
  })
  const { data, isLoading, error, refetch } = useAdminDashboardSummary({ range: dateRange })

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <QuickActionsRail />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Failed to load dashboard</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Select
            value={dateRange}
            onValueChange={(v) => setDateRange(v as AdminDashboardFilters['range'])}
          >
            <SelectTrigger className="w-[160px]">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
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
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
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
          {data.recent_escalations && data.recent_escalations.length > 0 && (
            <RecentEscalationsPanel escalations={data.recent_escalations} />
          )}
          <TopTenantsPanel topTenants={data.top_tenants ?? []} />
        </div>
      </div>
    </div>
  )
}
