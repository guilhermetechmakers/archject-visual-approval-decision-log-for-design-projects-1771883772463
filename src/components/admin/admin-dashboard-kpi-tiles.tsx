/**
 * Admin Dashboard KPI Tiles - active users, workspaces, API error rate, uptime, pending tickets.
 * Card-based metric tiles with gradient accents per design system.
 */

import {
  Users,
  Building2,
  AlertTriangle,
  Activity,
  Ticket,
} from 'lucide-react'
import { KpiTile } from './kpi-tile'
import type { DashboardSummary } from '@/types/admin'
import { cn } from '@/lib/utils'

interface AdminDashboardKpiTilesProps {
  data: DashboardSummary
  className?: string
}

export function AdminDashboardKpiTiles({ data, className }: AdminDashboardKpiTilesProps) {
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
