import { useState, useCallback } from 'react'
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { LibraryFile } from '@/types/files-library'

export interface PreviewModalProps {
  file: LibraryFile | null
  files?: LibraryFile[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload?: (file: LibraryFile) => void
  onNavigateToDecision?: (decisionId: string) => void
}

const BIM_MIME_PATTERNS = /\.(rvt|dwg|ifc)$/i

export function PreviewModal({
  file,
  files = [],
  open,
  onOpenChange,
  onDownload,
}: PreviewModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentFile = file ?? (files.length ? files[currentIndex] : null)
  const hasMultiple = files.length > 1
  const canPrev = hasMultiple && currentIndex > 0
  const canNext = hasMultiple && currentIndex < files.length - 1

  const isBim = currentFile
    ? BIM_MIME_PATTERNS.test(currentFile.name) || currentFile.type === 'BIM'
    : false

  const isPdf = currentFile?.mimeType === 'application/pdf'
  const isImage =
    currentFile?.mimeType?.startsWith('image/') ?? false

  const handlePrev = useCallback(() => {
    if (canPrev) {
      setCurrentIndex((i) => i - 1)
      setZoom(1)
      setRotation(0)
    }
  }, [canPrev])

  const handleNext = useCallback(() => {
    if (canNext) {
      setCurrentIndex((i) => i + 1)
      setZoom(1)
      setRotation(0)
    }
  }, [canNext])

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 3)), [])
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.5)), [])
  const handleRotate = useCallback(() => setRotation((r) => (r + 90) % 360), [])

  if (!currentFile) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0"
        showClose={true}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="truncate text-lg">
              {currentFile.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {(isImage || isPdf) && (
                <>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleZoomOut}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleZoomIn}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleRotate}
                    aria-label="Rotate"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDownload?.(currentFile)}
                asChild={!!currentFile.cdnUrl}
                aria-label="Download"
              >
                {currentFile.cdnUrl ? (
                  <a
                    href={currentFile.cdnUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {hasMultiple && (
            <div className="flex items-center justify-center gap-2 py-2 border-b border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={!canPrev}
                aria-label="Previous file"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {files.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={!canNext}
                aria-label="Next file"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-muted/30">
            {isBim ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-12 text-center max-w-md">
                <ExternalLink className="h-16 w-16 text-muted-foreground mx-auto" />
                <p className="mt-4 font-medium">BIM Preview</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Autodesk Forge integration coming soon. Use the download button
                  to access the file.
                </p>
                {currentFile.cdnUrl && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    asChild
                  >
                    <a
                      href={currentFile.cdnUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download file
                    </a>
                  </Button>
                )}
              </div>
            ) : isImage && currentFile.previewUrl ? (
              <img
                src={currentFile.previewUrl}
                alt={currentFile.name}
                className="max-w-full max-h-[70vh] object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            ) : isPdf && currentFile.cdnUrl ? (
              <iframe
                src={currentFile.cdnUrl}
                title={currentFile.name}
                className="w-full h-[70vh] rounded-lg border border-border"
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">
                  Preview not available for this file type.
                </p>
                {currentFile.cdnUrl && (
                  <Button variant="outline" className="mt-4" asChild>
                    <a
                      href={currentFile.cdnUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
