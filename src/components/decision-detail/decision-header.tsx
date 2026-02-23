import { Link } from 'react-router-dom'
import { Share2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { DecisionDetail } from '@/types/decision-detail'

const statusVariant: Record<
  string,
  'default' | 'success' | 'warning' | 'destructive'
> = {
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export interface DecisionHeaderProps {
  decision: DecisionDetail
  projectId: string
  projectName?: string
  onShareClick?: () => void
}

export function DecisionHeader({
  decision,
  projectId,
  projectName,
  onShareClick,
}: DecisionHeaderProps) {
  const assigneeNames = decision.assigneeNames ?? decision.assignees
  const lastAction = decision.lastActionTime ?? decision.updatedAt

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/dashboard/projects/${projectId}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {projectName ?? 'Project'}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {decision.title}
            </h1>
            <Badge
              variant={statusVariant[decision.status] ?? 'default'}
              className="text-sm font-medium"
            >
              {decision.status}
            </Badge>
          </div>
          {projectName && (
            <p className="mt-1 text-muted-foreground">{projectName}</p>
          )}
          {decision.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {decision.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Last action: {formatDate(lastAction)}</span>
            {assigneeNames.length > 0 && (
              <div className="flex items-center gap-2">
                <span>Assignees:</span>
                <div className="flex -space-x-2">
                  {assigneeNames.slice(0, 3).map((name, i) => (
                    <Avatar
                      key={i}
                      className="h-6 w-6 border-2 border-background text-[10px]"
                    >
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {assigneeNames.length > 3 && (
                    <span className="ml-1 text-xs">
                      +{assigneeNames.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onShareClick}
          className={cn(
            'shrink-0 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
            'bg-primary text-primary-foreground shadow hover:shadow-md'
          )}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share / Client Link
        </Button>
      </div>
    </div>
  )
}
