/**
 * Audit Log Panel - collapsible list of admin actions with filters.
 */

import * as React from 'react'
import { ChevronDown, ChevronUp, History, Filter } from 'lucide-react'
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

export function AuditLogPanel({ className, defaultExpanded = false }: AuditLogPanelProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const [actionFilter, setActionFilter] = React.useState<string>('all')
  const [targetFilter, setTargetFilter] = React.useState('')

  const { data: logs, isLoading } = useAdminAuditLogs(
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

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader
        className="cursor-pointer select-none py-4 transition-colors hover:bg-muted/50"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-5 w-5 text-primary" />
            Audit Trail
          </CardTitle>
          <Button variant="ghost" size="icon-sm" aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
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
              className="max-w-[200px]"
            />
          </div>
          <ScrollArea className="h-[240px] rounded-lg border border-border">
            {isLoading ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No audit entries</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
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
    <div className="flex flex-col gap-1 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{formatTimestamp(log.timestamp)}</span>
      </div>
      <div className="text-muted-foreground">
        {log.target_type} · {log.target_id}
        {log.admin_id && ` · by ${log.admin_id}`}
      </div>
    </div>
  )
}
