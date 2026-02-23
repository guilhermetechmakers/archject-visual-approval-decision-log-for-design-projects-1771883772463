import { History, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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

export interface VersionHistoryPanelProps {
  versions: FileVersion[]
  currentVersionId?: string
  onRevert?: (version: FileVersion) => void
  isReverting?: boolean
  className?: string
}

export function VersionHistoryPanel({
  versions,
  currentVersionId,
  onRevert,
  isReverting = false,
  className,
}: VersionHistoryPanelProps) {
  const sortedVersions = [...versions].sort(
    (a, b) => b.versionNumber - a.versionNumber
  )

  return (
    <Card
      className={cn(
        'rounded-xl border border-border shadow-card',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-base font-semibold">Version History</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Previous versions with notes. Revert to restore an earlier version.
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[240px]">
          <div className="space-y-2 pr-4">
            {sortedVersions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No version history
              </div>
            ) : (
              sortedVersions.map((v) => {
                const isCurrent = v.id === currentVersionId
                return (
                  <div
                    key={v.id}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                      isCurrent
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-secondary/50'
                    )}
                  >
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
                        {formatDate(v.createdAt)} • {v.uploaderName ?? 'Unknown'}
                      </p>
                      {v.notes && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {v.notes}
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
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
