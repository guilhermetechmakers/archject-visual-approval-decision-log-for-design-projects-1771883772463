/**
 * Admin Dashboard - overview with accounts, health, support, usage, alerts, escalations.
 */

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
} from '@/components/admin'
import { useAdminDashboardSummary } from '@/hooks/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'

export function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminDashboardSummary()

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
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <QuickActionsRail />

      {data.alerts && data.alerts.length > 0 && (
        <AlertsPanel alerts={data.alerts} />
      )}

      <AccountsOverviewCard data={data.accounts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SystemHealthPanel data={data.system_health} />
        <SupportQueuePanel summary={data.support_queue} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UsagePanel data={data.usage} />
        <div className="space-y-6">
          {data.recent_escalations && data.recent_escalations.length > 0 && (
            <RecentEscalationsPanel escalations={data.recent_escalations} />
          )}
          {data.top_tenants && data.top_tenants.length > 0 && (
            <TopTenantsPanel topTenants={data.top_tenants} />
          )}
        </div>
      </div>
    </div>
  )
}
