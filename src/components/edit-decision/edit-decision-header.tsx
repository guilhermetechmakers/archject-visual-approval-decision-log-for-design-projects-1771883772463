import { Link } from 'react-router-dom'
import { ChevronLeft, Save, X, RotateCcw, Send, Lock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VersionedDecision } from '@/types/edit-decision'
import type { DecisionStatus } from '@/types/workspace'

const STATUS_VARIANT: Record<
  DecisionStatus,
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

export interface EditDecisionHeaderProps {
  decision: VersionedDecision
  projectId: string
  projectName?: string
  hasUnsavedChanges?: boolean
  onSave?: () => void
  onCancel?: () => void
  onRevert?: () => void
  onPublish?: () => void
  isSaving?: boolean
  /** Optimistic concurrency: conflict detected (409) */
  hasConflict?: boolean
  /** Version number for lock indicator */
  version?: number
  className?: string
}

export function EditDecisionHeader({
  decision,
  projectId,
  projectName,
  hasUnsavedChanges = false,
  onSave,
  onCancel,
  onRevert,
  onPublish,
  isSaving = false,
  hasConflict = false,
  version,
  className,
}: EditDecisionHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {hasConflict && (
        <div
          className="flex items-center gap-2 rounded-lg border border-warning bg-warning/10 px-4 py-3 text-sm text-foreground"
          role="alert"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" aria-hidden />
          <span>
            This decision was modified by another user. Revert to reload the latest version, or save to overwrite.
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/dashboard/projects/${projectId}/decisions`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {projectName ?? 'Decisions'}
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        <Button asChild variant="ghost" size="sm">
          <Link to={`/dashboard/projects/${projectId}/decisions/${decision.id}/internal`}>
            {decision.title}
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
              variant={STATUS_VARIANT[decision.status] ?? 'default'}
              className="text-sm font-medium"
            >
              {decision.status}
            </Badge>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-warning-muted border-warning-muted">
                Unsaved
              </Badge>
            )}
            {version != null && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" aria-hidden />
                v{version}
              </Badge>
            )}
          </div>
          {projectName && (
            <p className="mt-1 text-sm text-muted-foreground">{projectName}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {formatDate(decision.updated_at)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
          {onRevert && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRevert}
              disabled={isSaving}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Revert
            </Button>
          )}
          {onSave && (
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
          {onPublish && decision.status === 'draft' && (
            <Button
              size="sm"
              onClick={onPublish}
              disabled={isSaving}
              className="bg-primary text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
            >
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
