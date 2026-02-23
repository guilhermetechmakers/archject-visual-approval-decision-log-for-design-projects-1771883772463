import { GitBranch, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CollapsibleSection } from './collapsible-section'
import { cn } from '@/lib/utils'
import type { AuditLogEntry, AuditAction } from '@/types/edit-decision'

const ACTION_LABELS: Record<AuditAction, string> = {
  created: 'Created',
  updated: 'Updated',
  status_change: 'Status changed',
  approval: 'Approved',
  comment: 'Commented',
  reissue: 'Share link reissued',
  object_added: 'Object added',
  object_removed: 'Object removed',
  object_updated: 'Object updated',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface HistoryPanelProps {
  entries: AuditLogEntry[]
  isLoading?: boolean
  filterAction?: AuditAction | 'all'
  onFilterActionChange?: (action: AuditAction | 'all') => void
  onEntryClick?: (entry: AuditLogEntry) => void
  className?: string
}

export function HistoryPanel({
  entries,
  isLoading = false,
  filterAction = 'all',
  onFilterActionChange,
  onEntryClick,
  className,
}: HistoryPanelProps) {
  return (
    <CollapsibleSection
      title="History / Audit"
      defaultOpen={false}
      className={className}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filterAction}
            onValueChange={(v) => onFilterActionChange?.(v as AuditAction | 'all')}
          >
            <SelectTrigger className="w-[140px]" aria-label="Filter by action">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {(Object.keys(ACTION_LABELS) as AuditAction[]).map((a) => (
                <SelectItem key={a} value={a}>
                  {ACTION_LABELS[a]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-secondary" />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="space-y-2">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit entries yet.</p>
            ) : (
              <ul className="space-y-2" role="list">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3 transition-all duration-200 hover:bg-secondary/50',
                      onEntryClick && 'cursor-pointer'
                    )}
                    onClick={() => onEntryClick?.(entry)}
                    role={onEntryClick ? 'button' : undefined}
                    tabIndex={onEntryClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onEntryClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        onEntryClick(entry)
                      }
                    }}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <GitBranch className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {ACTION_LABELS[entry.action]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.user_name ?? 'System'}
                        {' · '}
                        {formatDate(entry.timestamp)}
                      </p>
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {JSON.stringify(entry.details)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}
