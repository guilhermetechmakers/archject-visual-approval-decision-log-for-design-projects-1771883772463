import { useState, useCallback } from 'react'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDecisionEditor } from '@/contexts/decision-editor-context'

export interface DecisionEditorSideBySideProps {
  onNext?: () => void
}

export function DecisionEditorSideBySide({ onNext }: DecisionEditorSideBySideProps) {
  const { options, setStep } = useDecisionEditor()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 3)), [])
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.5)), [])
  const handleReset = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    },
    [pan]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart]
  )

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const optionsWithMedia = options.filter((o) => o.mediaFiles.length > 0)

  return (
    <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Side-by-side comparison</CardTitle>
        <p className="text-sm text-muted-foreground">
          Arrange options, designate primary media, add annotations. Supports zoom and pan.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleReset}
              aria-label="Reset view"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div
          className={cn(
            'relative overflow-hidden rounded-xl border border-border bg-secondary/30',
            isDragging && 'cursor-grabbing'
          )}
          style={{ minHeight: 320 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="flex gap-6 p-6 transition-transform duration-150"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {optionsWithMedia.length === 0 ? (
              <div className="flex min-h-[280px] w-full items-center justify-center text-muted-foreground">
                Add options with media in the previous step to compare here.
              </div>
            ) : (
              optionsWithMedia.map((option) => {
                const primaryMedia = option.mediaFiles.find((m) => m.isPrimary)
                const media = primaryMedia || option.mediaFiles[0]
                if (!media) return null

                return (
                  <div
                    key={option.id}
                    className="flex min-w-[200px] max-w-[320px] flex-col rounded-lg border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover"
                  >
                    <div className="aspect-video overflow-hidden rounded-t-lg bg-secondary">
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={option.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            {media.fileName}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium">{option.title}</h4>
                      {option.caption && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {option.caption}
                        </p>
                      )}
                      {option.cost && (
                        <p className="mt-2 text-sm font-medium text-primary">
                          {option.cost}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          On mobile: pinch to zoom, swipe to pan. Primary media from each option is shown.
        </p>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => (onNext ? onNext() : setStep('approval'))}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Next: Approval Rules
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
