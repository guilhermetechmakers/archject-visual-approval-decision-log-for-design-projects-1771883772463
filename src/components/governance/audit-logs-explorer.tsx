/**
 * Audit Logs Explorer - immutable-style log listing with filters and pagination.
 * Design: card-based, date-range picker, filters, export options.
 */

import * as React from 'react'
import { History, Filter, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuditLogs } from '@/hooks/use-governance'
import type { AuditLog } from '@/types/governance'
import { cn } from '@/lib/utils'

const ACTION_OPTIONS = [
  { value: 'all', label: 'All actions' },
  { value: 'decision_approved', label: 'Decision approved' },
  { value: 'export_created', label: 'Export created' },
  { value: 'retention_policy_updated', label: 'Retention policy updated' },
  { value: 'user_invited', label: 'User invited' },
  { value: 'privacy_control_updated', label: 'Privacy control updated' },
]

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  return d.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function AuditLogRow({ log }: { log: AuditLog }) {
  return (
    <div
      className="flex flex-col gap-1 border-b border-border px-4 py-3 last:border-0 transition-colors hover:bg-muted/30"
      role="row"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium text-foreground">{log.action.replace(/_/g, ' ')}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{formatTimestamp(log.timestamp)}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>Resource: {log.resource}</span>
        {log.target_id && <span>Target: {log.target_id}</span>}
        <span>User: {log.user_id}</span>
        {log.workspace_id && <span>Workspace: {log.workspace_id}</span>}
      </div>
      {log.immutable_hash && (
        <div className="text-xs text-muted-foreground font-mono truncate" title={log.immutable_hash}>
          Hash: {log.immutable_hash}
        </div>
      )}
    </div>
  )
}

export interface AuditLogsExplorerProps {
  workspaceId?: string
  projectId?: string
  className?: string
}

export function AuditLogsExplorer({ workspaceId, projectId, className }: AuditLogsExplorerProps) {
  const [actionFilter, setActionFilter] = React.useState<string>('all')
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [offset, setOffset] = React.useState(0)
  const limit = 20

  const filters = React.useMemo(
    () => ({
      workspace_id: workspaceId,
      project_id: projectId,
      action: actionFilter === 'all' ? undefined : actionFilter,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      limit,
      offset,
    }),
    [workspaceId, projectId, actionFilter, dateFrom, dateTo, offset]
  )

  const { data, isLoading } = useAuditLogs(filters)

  const [isExporting, setIsExporting] = React.useState(false)
  const handleExport = () => {
    setIsExporting(true)
    // Export would trigger API call - placeholder; simulate async for loading state
    setTimeout(() => setIsExporting(false), 1500)
  }

  return (
    <Card className={cn('overflow-hidden rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover', className)}>
      <CardHeader className="border-b border-border bg-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Audit Logs Explorer
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full w-fit"
            onClick={handleExport}
            disabled={isExporting}
            aria-label={isExporting ? 'Exporting audit logs' : 'Export audit logs'}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="mr-2 h-4 w-4" aria-hidden />
            )}
            {isExporting ? 'Exporting…' : 'Export'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="audit-action" className="text-xs">Action</Label>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setOffset(0) }}>
              <SelectTrigger id="audit-action" className="w-[180px] rounded-lg bg-input">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-date-from" className="text-xs">From</Label>
            <Input
              id="audit-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setOffset(0) }}
              className="rounded-lg bg-input w-[140px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-date-to" className="text-xs">To</Label>
            <Input
              id="audit-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setOffset(0) }}
              className="rounded-lg bg-input w-[140px]"
            />
          </div>
        </div>

        <ScrollArea className="h-[320px] rounded-lg border border-border">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No audit entries found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.items.map((log) => (
                <AuditLogRow key={log.id} log={log} />
              ))}
            </div>
          )}
        </ScrollArea>

        {data && data.total > limit && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {offset + 1}–{Math.min(offset + limit, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset((o) => Math.max(0, o - limit))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={offset + limit >= data.total}
                onClick={() => setOffset((o) => o + limit)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
