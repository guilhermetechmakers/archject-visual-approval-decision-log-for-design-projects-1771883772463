/**
 * Analytics drilldown - filtered decision list from KPI/stage click
 */

import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  ChevronLeft,
  ExternalLink,
  Share2,
  FileDown,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDrilldown } from '@/hooks/use-analytics'
import {
  generateCsvFromDecisions,
  downloadCsv,
  formatFilename,
} from '@/lib/report-export-service'
import { toast } from 'sonner'
import type { DrilldownFilters } from '@/types/analytics'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

export function AnalyticsDrilldownPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as {
    type?: string
    stage?: string
    from?: string
    to?: string
  } | null

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const pageSize = 25

  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 30)
  const defaultFrom = start.toISOString().slice(0, 10)
  const defaultTo = now.toISOString().slice(0, 10)

  const filters: DrilldownFilters = {
    type: (state?.type as DrilldownFilters['type']) ?? 'bottleneck',
    from: state?.from ?? defaultFrom,
    to: state?.to ?? defaultTo,
    stage: state?.stage,
  }

  const { data, isLoading } = useDrilldown(filters, page, pageSize)

  const decisions = data?.decisions ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const filteredDecisions = search
    ? decisions.filter(
        (d) =>
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.project_name.toLowerCase().includes(search.toLowerCase())
      )
    : decisions

  const handleExportCsv = () => {
    const csv = generateCsvFromDecisions(
      filteredDecisions,
      `Drilldown ${filters.type} (${filters.from} to ${filters.to})`
    )
    downloadCsv(csv, formatFilename('drilldown', undefined, filters.from, filters.to))
    toast.success('CSV downloaded')
  }

  const handleShareLink = (decisionId: string, projectId: string) => {
    const url = `${window.location.origin}/dashboard/projects/${projectId}/decisions/${decisionId}/internal`
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link copied'),
      () => toast.error('Failed to copy')
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Drilldown</h1>
            <p className="text-sm text-muted-foreground">
              {filters.stage ? `Stage: ${filters.stage}` : `Type: ${filters.type}`} •{' '}
              {filters.from} to {filters.to}
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border border-border shadow-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Decisions</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search decisions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px] rounded-lg"
              />
              <Button variant="outline" size="sm" onClick={handleExportCsv} className="rounded-lg">
                <FileDown className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredDecisions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">No decisions match your filters</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/dashboard/analytics')}
              >
                Back to Analytics
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="font-medium">Title</TableHead>
                      <TableHead className="font-medium">Project</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">Stage</TableHead>
                      <TableHead className="font-medium">Response time</TableHead>
                      <TableHead className="font-medium">Updated</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDecisions.map((d) => (
                      <TableRow
                        key={d.id}
                        className="transition-colors hover:bg-secondary/50"
                      >
                        <TableCell>
                          <Link
                            to={`/dashboard/projects/${d.project_id}/decisions/${d.id}/internal`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {d.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {d.project_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[d.status] ?? 'default'}>
                            {d.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {d.stage ?? '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {d.response_time_hours != null
                            ? formatHours(d.response_time_hours)
                            : '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(d.updated_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  to={`/dashboard/projects/${d.project_id}/decisions/${d.id}/internal`}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Open decision
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleShareLink(d.id, d.project_id)}
                              >
                                <Share2 className="h-4 w-4" />
                                Share client link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({total} decisions)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
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
