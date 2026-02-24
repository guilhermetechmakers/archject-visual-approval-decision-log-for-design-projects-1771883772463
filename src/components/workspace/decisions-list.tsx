import { Link } from 'react-router-dom'
import { Plus, FileText, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Decision } from '@/types/workspace'

export interface DecisionsListProps {
  decisions: Decision[]
  projectId?: string
  onCreateDecision?: () => void
  onApplyTemplate?: () => void
  onExportLog?: () => void
  className?: string
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
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

export function DecisionsList({
  decisions,
  projectId,
  onCreateDecision,
  onApplyTemplate,
  onExportLog,
  className,
}: DecisionsListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Decisions</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onCreateDecision}
            aria-label="Create new decision"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Create decision
          </Button>
        </div>
      </div>

      {decisions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No decisions yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first decision or apply a template to get started.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={onCreateDecision}
                aria-label="Create your first decision"
              >
                Create decision
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onApplyTemplate}
                aria-label="Apply template to create decision"
              >
                Apply template
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {decisions.map((decision) => (
            <Card
              key={decision.id}
              className="transition-all duration-200 hover:shadow-card-hover hover:bg-muted"
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={projectId ? `/dashboard/projects/${projectId}/decisions/${decision.id}/internal` : `/dashboard/decisions/${decision.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {decision.title}
                      </Link>
                      <Badge variant={statusVariant[decision.status] ?? 'default'}>
                        {decision.status}
                      </Badge>
                    </div>
                    {decision.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {decision.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>Due: {formatDate(decision.due_date)}</span>
                      {decision.assignee_name && (
                        <span>Assignee: {decision.assignee_name}</span>
                      )}
                      <span>
                        Updated{' '}
                        {new Date(decision.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={projectId ? `/dashboard/projects/${projectId}/decisions/${decision.id}/internal` : `/dashboard/decisions/${decision.id}`}>
                        Open
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Decision actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={projectId ? `/dashboard/projects/${projectId}/decisions/${decision.id}/edit` : `/dashboard/decisions/${decision.id}/edit`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportLog}>
                          Export related logs
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
