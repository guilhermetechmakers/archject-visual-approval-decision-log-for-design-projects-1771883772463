import { History, RotateCcw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { FileVersion } from '@/types/files-library'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface VersionTimelineProps {
  versions: FileVersion[]
  currentVersionId?: string
  onRevert?: (version: FileVersion) => void
  isReverting?: boolean
  className?: string
}

export function VersionTimeline({
  versions,
  currentVersionId,
  onRevert,
  isReverting = false,
  className,
}: VersionTimelineProps) {
  const sortedVersions = [...versions].sort(
    (a, b) => b.versionNumber - a.versionNumber
  )

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-card',
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-base font-semibold">Version Timeline</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Visual history of file versions. Revert to restore an earlier version.
      </p>
      <ScrollArea className="h-[280px]">
        <div className="relative pl-6">
          {/* Vertical line */}
          <div
            className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border"
            aria-hidden
          />
          <div className="space-y-0">
            {sortedVersions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No version history
              </div>
            ) : (
              sortedVersions.map((v, idx) => {
                const isCurrent = v.id === currentVersionId
                const isLast = idx === sortedVersions.length - 1
                return (
                  <div
                    key={v.id}
                    className={cn(
                      'relative flex gap-4 pb-6',
                      !isLast && 'min-h-[80px]'
                    )}
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        'absolute left-0 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        isCurrent
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card'
                      )}
                    >
                      {isCurrent ? (
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <span className="text-[10px] font-semibold">
                          {v.versionNumber}
                        </span>
                      )}
                    </div>
                    <div
                      className={cn(
                        'min-w-0 flex-1 rounded-lg border p-3 transition-all duration-200',
                        isCurrent
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:bg-secondary/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">v{v.versionNumber}</span>
                            {isCurrent && (
                              <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(v.createdAt)} •{' '}
                            {v.uploaderName ?? 'Unknown'}
                          </p>
                          {v.notes && (
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                              {v.notes}
                            </p>
                          )}
                          {v.size != null && v.size > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {(v.size / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                        {!isCurrent && onRevert && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRevert(v)}
                            disabled={isReverting}
                            className="shrink-0"
                            aria-label={`Revert to version ${v.versionNumber}`}
                          >
                            <RotateCcw className="mr-1 h-4 w-4" />
                            Revert
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
