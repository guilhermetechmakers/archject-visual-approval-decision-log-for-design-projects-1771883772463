import { Link } from 'react-router-dom'
import { FileCheck, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { DecisionPreview } from '@/types/decisions-list'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export interface PreviewPaneProps {
  decision: DecisionPreview | null
  projectId: string
  isLoading?: boolean
  onClose?: () => void
  className?: string
}

export function PreviewPane({
  decision,
  projectId,
  isLoading = false,
  onClose,
  className,
}: PreviewPaneProps) {
  if (!decision && !isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 p-8 text-center',
          className
        )}
      >
        <FileCheck className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Select a decision to preview
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Click or hover over a row to view details
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!decision) return null

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card shadow-card overflow-hidden',
        className
      )}
      role="complementary"
      aria-label="Decision preview"
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-semibold text-foreground truncate pr-2">
          {decision.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link
              to={`/dashboard/projects/${projectId}/decisions/${decision.id}/edit`}
              aria-label="Open in edit page"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={onClose}
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
        <div className="p-4 space-y-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Status
            </p>
            <Badge variant={STATUS_VARIANT[decision.status] ?? 'default'}>
              {decision.status}
            </Badge>
          </div>

          {decision.summary && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Summary
              </p>
              <p className="text-sm text-foreground">{decision.summary}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Key details
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Due date</dt>
                <dd className="font-medium">{formatDate(decision.due_date)}</dd>
              </div>
              {decision.assignee_name && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Assignee</dt>
                  <dd className="font-medium">{decision.assignee_name}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Files</dt>
                <dd className="font-medium">{decision.files_count ?? 0}</dd>
              </div>
              {decision.has_share_link && (
                <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Share link</dt>
                <dd className="font-medium">
                  <span
                    className={
                      decision.share_link_status === 'active'
                        ? 'text-success'
                        : 'text-muted-foreground'
                    }
                  >
                    {decision.share_link_status === 'active' ? 'Active' : 'Expired'}
                  </span>
                </dd>
              </div>
              )}
            </dl>
          </div>

          {decision.options && decision.options.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Key options
              </p>
              <ul className="space-y-2">
                {decision.options.map((opt) => (
                  <li
                    key={opt.key}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-muted-foreground">{opt.key}</span>
                    <span className="font-medium">{opt.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {decision.recent_activity && decision.recent_activity.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Recent activity
              </p>
              <ul className="space-y-2">
                {decision.recent_activity.map((a, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {a.action}
                    {a.actor && ` by ${a.actor}`}
                    {' · '}
                    {formatDate(a.changed_at)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <Button className="w-full rounded-full" asChild>
          <Link
            to={`/dashboard/projects/${projectId}/decisions/${decision.id}/edit`}
          >
            Open in Edit / Manage
          </Link>
        </Button>
      </div>
    </div>
  )
}
