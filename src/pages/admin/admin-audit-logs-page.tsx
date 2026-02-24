/**
 * Admin Audit Logs Explorer - immutable audit trail with filters and export.
 * Design: card-based, pill tabs, date-range picker, pagination.
 */

import * as React from 'react'
import { History, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useGovernanceAuditLogs } from '@/hooks/use-governance'
import type { AuditLog } from '@/types/governance'

const PAGE_SIZE = 20
const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'decision_approved', label: 'Decision approved' },
  { value: 'export_created', label: 'Export created' },
  { value: 'retention_policy_updated', label: 'Retention policy updated' },
  { value: 'user_invited', label: 'User invited' },
  { value: 'privacy_control_updated', label: 'Privacy control updated' },
]

function formatDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function AdminAuditLogsPage() {
  const [page, setPage] = React.useState(0)
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const [actionFilter, setActionFilter] = React.useState('')
  const [userFilter, setUserFilter] = React.useState('')

  const filters = React.useMemo(() => {
    const f: Record<string, string | number | undefined> = {
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }
    if (dateFrom) f.date_from = dateFrom
    if (dateTo) f.date_to = dateTo
    if (actionFilter) f.action = actionFilter
    if (userFilter.trim()) f.user_id = userFilter.trim()
    return f
  }, [page, dateFrom, dateTo, actionFilter, userFilter])

  const { data, isLoading, error } = useGovernanceAuditLogs(filters)

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleExport = () => {
    // Placeholder - would trigger export job
    window.open('#', '_self')
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Failed to load audit logs</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs Explorer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Immutable audit trail for compliance and review
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export logs
        </Button>
      </div>

      <Card className="overflow-hidden rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Audit trail
          </CardTitle>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="date-from" className="text-sm text-muted-foreground">
                From
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(0)
                }}
                className="h-9 w-40 rounded-lg bg-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="date-to" className="text-sm text-muted-foreground">
                To
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(0)
                }}
                className="h-9 w-40 rounded-lg bg-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={actionFilter || 'all'}
                onValueChange={(v) => {
                  setActionFilter(v === 'all' ? '' : v)
                  setPage(0)
                }}
              >
                <SelectTrigger className="h-9 w-[180px] rounded-lg bg-input">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_OPTIONS.map((o) => (
                    <SelectItem key={o.value || 'all'} value={o.value || 'all'}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="Filter by user ID..."
              value={userFilter}
              onChange={(e) => {
                setUserFilter(e.target.value)
                setPage(0)
              }}
              className="h-9 w-48 rounded-lg bg-input"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <History className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium text-foreground">No audit entries</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adjust filters or date range to see results
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Hash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((log: AuditLog) => (
                      <AuditLogRow key={log.id} log={log} />
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of{' '}
                    {total}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AuditLogRow({ log }: { log: AuditLog }) {
  return (
    <TableRow className="transition-colors hover:bg-muted/50">
      <TableCell className="font-mono text-xs text-muted-foreground">
        {formatDate(log.timestamp)}
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="rounded-full font-medium">
          {log.action}
        </Badge>
      </TableCell>
      <TableCell>{log.resource}</TableCell>
      <TableCell className="font-mono text-xs">{log.user_id}</TableCell>
      <TableCell className="font-mono text-xs">{log.workspace_id}</TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {log.immutable_hash ? String(log.immutable_hash).slice(0, 12) + '…' : '—'}
      </TableCell>
    </TableRow>
  )
}
