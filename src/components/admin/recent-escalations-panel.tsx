/**
 * Recent Escalations Panel - recent support escalations.
 * Design: card-based, design tokens, empty state with descriptive message and CTA.
 */

import { Link } from 'react-router-dom'
import { TicketPlus, ArrowRight, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Escalation } from '@/types/admin'
import { cn } from '@/lib/utils'

interface RecentEscalationsPanelProps {
  escalations: Escalation[]
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  className?: string
}

const priorityVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  low: 'default',
  medium: 'default',
  high: 'warning',
  critical: 'destructive',
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  open: 'destructive',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
}

function formatDate(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return d.toLocaleDateString()
}

function EscalationsEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-12 text-center"
      role="status"
      aria-label="No recent escalations"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
        <TicketPlus className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">No recent escalations</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Support escalations will appear here when issues are raised by users or workspaces. Visit
        the support tools to manage and respond to tickets.
      </p>
      <Button variant="default" size="sm" className="mt-4 rounded-full" asChild>
        <Link to="/admin/tools" className="inline-flex items-center gap-2">
          View Support Tools
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  )
}

function EscalationsErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-12 text-center"
      role="alert"
      aria-label="Failed to load escalations"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">Failed to load escalations</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Something went wrong. Please try again or contact support if the problem persists.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

function EscalationsLoadingSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading escalations">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex shrink-0 gap-1">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function RecentEscalationsPanel({
  escalations,
  isLoading = false,
  error = null,
  onRetry,
  className,
}: RecentEscalationsPanelProps) {
  const list = escalations ?? []
  const isEmpty = list.length === 0

  return (
    <Card className={cn('overflow-hidden shadow-card', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-foreground">
          <TicketPlus className="h-5 w-5 text-primary" aria-hidden />
          Recent Escalations
        </CardTitle>
        {!isEmpty && !isLoading && !error && (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/tools" className="inline-flex items-center gap-1">
              View all
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <EscalationsLoadingSkeleton />
        ) : error ? (
          <EscalationsErrorState onRetry={onRetry} />
        ) : isEmpty ? (
          <EscalationsEmptyState />
        ) : (
          <ul className="space-y-3">
            {list.slice(0, 5).map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{e.reason}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.workspace_id} · {formatDate(e.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  <Badge variant={priorityVariant[e.priority] ?? 'default'} className="text-xs">
                    {e.priority}
                  </Badge>
                  <Badge variant={statusVariant[e.status] ?? 'default'} className="text-xs">
                    {e.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
