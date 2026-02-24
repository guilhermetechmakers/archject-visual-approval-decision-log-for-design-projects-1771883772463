import { Download, Link2, FileArchive } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { VersionTimeline } from './version-timeline'
import { DecisionLinkIndicator } from './decision-link-indicator'
import type { LibraryFile, FileVersion } from '@/types/files-library'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface FileDetailModalProps {
  file: LibraryFile | null
  versions: FileVersion[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload?: (file: LibraryFile) => void
  onRevertVersion?: (version: FileVersion) => void
  onAttachToDecision?: (file: LibraryFile) => void
  onExport?: (file: LibraryFile) => void
  onNavigateToDecision?: (decisionId: string) => void
  onOpenPreview?: (file: LibraryFile) => void
  isReverting?: boolean
}

export function FileDetailModal({
  file,
  versions,
  open,
  onOpenChange,
  onDownload,
  onRevertVersion,
  onAttachToDecision,
  onExport,
  onNavigateToDecision,
  onOpenPreview,
  isReverting = false,
}: FileDetailModalProps) {
  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle className="truncate">{file.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="mt-1 capitalize">{file.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Size</p>
                <p className="mt-1">{formatSize(file.size)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Uploaded by
                </p>
                <p className="mt-1">{file.uploadedByName ?? file.uploadedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Uploaded at
                </p>
                <p className="mt-1">{formatDate(file.uploadedAt)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Linked decisions
                </p>
                <div className="mt-2">
                  <DecisionLinkIndicator
                    count={file.linkedDecisionsCount}
                    linkedDecisions={file.linkedDecisions}
                    onNavigate={onNavigateToDecision}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {onOpenPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenPreview(file)}
                >
                  Preview
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => onDownload?.(file)}
                asChild={!!file.cdnUrl}
              >
                {file.cdnUrl ? (
                  <a
                    href={file.cdnUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAttachToDecision?.(file)}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Attach to Decision
              </Button>
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport?.(file)}
                >
                  <FileArchive className="mr-2 h-4 w-4" />
                  Export bundle
                </Button>
              )}
            </div>

            <VersionTimeline
              versions={versions}
              currentVersionId={file.currentVersionId}
              onRevert={onRevertVersion}
              isReverting={isReverting}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
