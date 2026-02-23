import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DecisionOption } from '@/types/decision-detail'

function getMediaUrl(opt: DecisionOption): string | null {
  const firstId = opt.mediaPreviewIds[0]
  if (!firstId) return null
  const att = opt.attachments.find((a) => a.id === firstId)
  return att?.url ?? null
}

export interface SideBySideViewerProps {
  options: DecisionOption[]
  className?: string
}

export function SideBySideViewer({ options, className }: SideBySideViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [swipeStart, setSwipeStart] = useState<number | null>(null)

  const leftOpt = options[activeIndex] ?? null
  const rightOpt = options[activeIndex + 1] ?? null

  const leftUrl = leftOpt ? getMediaUrl(leftOpt) : null
  const rightUrl = rightOpt ? getMediaUrl(rightOpt) : null

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.25, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.25, 0.5))
  }, [])

  const handlePrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1))
  }, [])

  const handleNext = useCallback(() => {
    setActiveIndex((i) => Math.min(options.length - 2, i + 1))
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setSwipeStart(e.touches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (swipeStart === null) return
      const diff = swipeStart - e.changedTouches[0].clientX
      if (diff > 50) handleNext()
      else if (diff < -50) handlePrev()
      setSwipeStart(null)
    },
    [swipeStart, handleNext, handlePrev]
  )

  const canPrev = activeIndex > 0
  const canNext = activeIndex < options.length - 2 && options.length >= 2

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">
          Visual comparison
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
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
          <Button variant="ghost" size="icon-sm" aria-label="Fullscreen">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className="relative flex min-h-[280px] md:min-h-[360px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {options.length < 2 ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-muted-foreground">
              Add at least 2 options to compare side-by-side
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-1 flex-col border-r border-border">
              <div className="border-b border-border px-4 py-2 text-sm font-medium">
                {leftOpt?.title ?? 'Option A'}
              </div>
              <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-secondary/30 p-4">
                {leftUrl ? (
                  <img
                    src={leftUrl}
                    alt={leftOpt?.title ?? 'Option A'}
                    className="max-h-full max-w-full object-contain transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                  />
                ) : (
                  <PlaceholderMedia />
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="border-b border-border px-4 py-2 text-sm font-medium">
                {rightOpt?.title ?? 'Option B'}
              </div>
              <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-secondary/30 p-4">
                {rightUrl ? (
                  <img
                    src={rightUrl}
                    alt={rightOpt?.title ?? 'Option B'}
                    className="max-h-full max-w-full object-contain transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                  />
                ) : (
                  <PlaceholderMedia />
                )}
              </div>
            </div>
          </>
        )}

        {options.length >= 2 && (
          <>
            {canPrev && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 shadow-md md:left-4"
                onClick={handlePrev}
                aria-label="Previous comparison"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {canNext && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 shadow-md md:right-4"
                onClick={handleNext}
                aria-label="Next comparison"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </div>

      {options.length >= 2 && (
        <div className="flex justify-center gap-1 border-t border-border px-4 py-2">
          {Array.from({ length: Math.max(1, options.length - 1) }).map(
            (_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  i === activeIndex
                    ? 'bg-primary'
                    : 'bg-border hover:bg-muted-foreground/30'
                )}
                aria-label={`View comparison ${i + 1}`}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}

function PlaceholderMedia() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary">
        <Maximize2 className="h-8 w-8" />
      </div>
      <span className="text-sm">No media</span>
    </div>
  )
}
