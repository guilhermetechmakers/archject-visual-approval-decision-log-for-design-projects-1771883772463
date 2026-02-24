/**
 * Audit Log Panel - collapsible list of admin actions with filters.
 * Design: card-based, design tokens, skeleton loading, empty state with CTA.
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, History, Filter, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminAuditLogs } from '@/hooks/use-admin'
import type { AdminAuditLog } from '@/types/admin'
import { cn } from '@/lib/utils'

interface AuditLogPanelProps {
  className?: string
  defaultExpanded?: boolean
}

const ACTION_LABELS: Record<string, string> = {
  impersonate_start: 'Impersonation started',
  impersonate_end: 'Impersonation ended',
  user_suspend: 'User suspended',
  user_activate: 'User activated',
  workspace_disable: 'Workspace disabled',
  workspace_export: 'Data export triggered',
  workspace_retention: 'Retention policy set',
  escalation_create: 'Escalation created',
  token_revoke: 'Token revoked',
  force_logout: 'Force sign-out',
  session_revoke: 'Session revoked',
}

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString()
}

function AuditLogSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-border" role="status" aria-label="Loading audit logs">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>
      ))}
    </div>
  )
}

function AuditLogEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="status"
      aria-label="No audit entries"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <History className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">No audit entries</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        {hasFilters
          ? 'Try adjusting filters or date range to see results.'
          : 'Admin actions will appear here as they occur.'}
      </p>
      <Button variant="outline" size="sm" className="mt-4 rounded-full" asChild>
        <Link to="/admin/audit-logs" className="inline-flex items-center gap-2">
          View full audit logs
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  )
}

function AuditLogErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="alert"
      aria-label="Failed to load audit logs"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <History className="h-6 w-6 text-destructive" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">Failed to load audit logs</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Something went wrong. Please try again.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function AuditLogPanel({ className, defaultExpanded = false }: AuditLogPanelProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const [actionFilter, setActionFilter] = React.useState<string>('all')
  const [targetFilter, setTargetFilter] = React.useState('')

  const { data: logs, isLoading, isError, refetch } = useAdminAuditLogs(
    actionFilter === 'all' ? undefined : { action_type: actionFilter }
  )

  const filtered = React.useMemo(() => {
    if (!logs) return []
    if (!targetFilter.trim()) return logs
    const q = targetFilter.toLowerCase()
    return logs.filter(
      (l) =>
        l.target_id.toLowerCase().includes(q) ||
        l.admin_id.toLowerCase().includes(q)
    )
  }, [logs, targetFilter])

  const hasFilters = actionFilter !== 'all' || targetFilter.trim().length > 0

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
      role="region"
      aria-labelledby="audit-log-panel-title"
    >
      <CardHeader
        className="cursor-pointer select-none py-4 transition-colors hover:bg-muted/50"
        onClick={() => setExpanded((e) => !e)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls="audit-log-panel-content"
        aria-label={expanded ? 'Collapse audit trail panel' : 'Expand audit trail panel'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((prev) => !prev)
          }
        }}
      >
        <div className="flex items-center justify-between">
          <CardTitle
            id="audit-log-panel-title"
            className="flex items-center gap-2 text-base font-semibold text-foreground"
          >
            <History className="h-5 w-5 text-primary" aria-hidden />
            Audit Trail
          </CardTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={expanded ? 'Collapse audit trail' : 'Expand audit trail'}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent
          id="audit-log-panel-content"
          className="space-y-4 border-t border-border pt-4"
        >
          <div className="flex flex-wrap gap-2">
            <Select
              value={actionFilter}
              onValueChange={setActionFilter}
              aria-label="Filter by action type"
            >
              <SelectTrigger className="h-9 w-full min-w-[140px] max-w-[180px] rounded-lg bg-input">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {Object.entries(ACTION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by target ID..."
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="h-9 max-w-[200px] rounded-lg bg-input"
              aria-label="Filter audit logs by target or admin ID"
            />
          </div>
          <ScrollArea className="h-[240px] rounded-lg border border-border bg-card">
            {isLoading ? (
              <div className="p-2">
                <AuditLogSkeleton />
              </div>
            ) : isError ? (
              <AuditLogErrorState onRetry={() => refetch()} />
            ) : filtered.length === 0 ? (
              <AuditLogEmptyState hasFilters={hasFilters} />
            ) : (
              <div
                className="divide-y divide-border"
                role="list"
                aria-label="Audit log entries"
              >
                {filtered.map((log: AdminAuditLog) => (
                  <AuditLogItem key={log.id} log={log} />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}

function AuditLogItem({ log }: { log: AdminAuditLog }) {
  const label = ACTION_LABELS[log.action] ?? log.action
  return (
    <div
      className="flex flex-col gap-1 px-4 py-3 text-sm transition-colors hover:bg-muted/30"
      role="listitem"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {formatTimestamp(log.timestamp)}
        </span>
      </div>
      <div className="text-muted-foreground">
        {log.target_type} · {log.target_id}
        {log.admin_id && ` · by ${log.admin_id}`}
      </div>
    </div>
  )
}
