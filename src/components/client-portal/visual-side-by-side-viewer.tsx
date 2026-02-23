import { useState, useCallback, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PenLine,
  Share2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnnotationsOverlay } from './annotations-overlay'
import { cn } from '@/lib/utils'
import type {
  ClientPortalOption,
  ClientPortalAnnotation,
  MediaAsset,
} from '@/types/client-portal'

function getFirstMediaUrl(opt: ClientPortalOption): string | null {
  const first = opt.mediaAssets[0] ?? opt.mediaUrls?.[0]
  return typeof first === 'string' ? first : (first as MediaAsset)?.url ?? null
}

export interface VisualSideBySideViewerProps {
  options: ClientPortalOption[]
  annotations: ClientPortalAnnotation[]
  selectedOptionId?: string | null
  onSelectOption?: (optionId: string) => void
  onAnnotate?: (optionId: string, mediaId: string, data: unknown) => void
  onShare?: (optionId: string) => void
  accentColor?: string
  className?: string
}

export function VisualSideBySideViewer({
  options,
  annotations,
  selectedOptionId,
  onSelectOption,
  onAnnotate,
  onShare,
  accentColor = 'rgb(var(--primary))',
  className,
}: VisualSideBySideViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [swipeStart, setSwipeStart] = useState<number | null>(null)
  const [annotationMode, setAnnotationMode] = useState(false)
  const [mediaDimensions, setMediaDimensions] = useState({
    width: 0,
    height: 0,
  })
  const imgRef = useRef<HTMLImageElement>(null)

  const leftOpt = options[activeIndex] ?? null
  const rightOpt = options[activeIndex + 1] ?? null

  const leftUrl = leftOpt ? getFirstMediaUrl(leftOpt) : null
  const rightUrl = rightOpt ? getFirstMediaUrl(rightOpt) : null

  const leftMediaId = leftOpt?.mediaAssets[0]?.id ?? leftOpt?.id
  const rightMediaId = rightOpt?.mediaAssets[0]?.id ?? rightOpt?.id

  const leftAnnotations = annotations.filter(
    (a) => a.optionId === leftOpt?.id && a.mediaId === leftMediaId
  )
  const rightAnnotations = annotations.filter(
    (a) => a.optionId === rightOpt?.id && a.mediaId === rightMediaId
  )

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

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current
    if (img?.naturalWidth && img?.naturalHeight) {
      setMediaDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
  }, [])

  const canPrev = activeIndex > 0
  const canNext = activeIndex < options.length - 2 && options.length >= 2

  const handleAddAnnotation = useCallback(
    (opt: ClientPortalOption | null, mediaId: string) =>
      (data: {
        shape: 'point' | 'rectangle' | 'area'
        coordinates: { x: number; y: number; width?: number; height?: number }
        note?: string
        color?: string
      }) => {
        if (!opt || !onAnnotate) return
        onAnnotate(opt.id, mediaId, data)
      },
    [onAnnotate]
  )

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">
          Visual comparison
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant={annotationMode ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setAnnotationMode(!annotationMode)}
            className="gap-1"
            style={annotationMode ? { backgroundColor: accentColor } : undefined}
          >
            <PenLine className="h-4 w-4" />
            Annotate
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleZoomOut} aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[3rem] text-center text-xs text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon-sm" onClick={handleZoomIn} aria-label="Zoom in">
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
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <p className="text-muted-foreground">
              Add at least 2 options to compare side-by-side
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-1 flex-col border-r border-border">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <span className="text-sm font-medium">
                  {leftOpt?.title ?? 'Option A'}
                </span>
                <div className="flex gap-1">
                  {onSelectOption && leftOpt && (
                    <Button
                      variant={
                        selectedOptionId === leftOpt.id ? 'default' : 'ghost'
                      }
                      size="sm"
                      onClick={() => onSelectOption(leftOpt.id)}
                      style={
                        selectedOptionId === leftOpt.id
                          ? { backgroundColor: accentColor }
                          : undefined
                      }
                    >
                      Select
                    </Button>
                  )}
                  {onShare && leftOpt && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onShare(leftOpt.id)}
                      aria-label="Share option"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-secondary/30 p-4">
                {leftUrl ? (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <img
                      ref={activeIndex === 0 ? imgRef : undefined}
                      src={leftUrl}
                      alt={leftOpt?.title ?? 'Option A'}
                      className="max-h-full max-w-full object-contain transition-transform duration-200"
                      style={{ transform: `scale(${zoom})` }}
                      onLoad={activeIndex === 0 ? handleImageLoad : undefined}
                      loading="lazy"
                    />
                    {annotationMode && leftOpt && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <AnnotationsOverlay
                          annotations={leftAnnotations}
                          mediaWidth={mediaDimensions.width || 800}
                          mediaHeight={mediaDimensions.height || 600}
                          onAdd={
                            onAnnotate
                              ? handleAddAnnotation(leftOpt, leftMediaId)
                              : undefined
                          }
                          readOnly={!annotationMode}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <PlaceholderMedia />
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <span className="text-sm font-medium">
                  {rightOpt?.title ?? 'Option B'}
                </span>
                <div className="flex gap-1">
                  {onSelectOption && rightOpt && (
                    <Button
                      variant={
                        selectedOptionId === rightOpt.id ? 'default' : 'ghost'
                      }
                      size="sm"
                      onClick={() => onSelectOption(rightOpt.id)}
                      style={
                        selectedOptionId === rightOpt.id
                          ? { backgroundColor: accentColor }
                          : undefined
                      }
                    >
                      Select
                    </Button>
                  )}
                  {onShare && rightOpt && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onShare(rightOpt.id)}
                      aria-label="Share option"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-secondary/30 p-4">
                {rightUrl ? (
                  <div className="relative h-full w-full">
                    <img
                      src={rightUrl}
                      alt={rightOpt?.title ?? 'Option B'}
                      className="max-h-full max-w-full object-contain transition-transform duration-200"
                      style={{ transform: `scale(${zoom})` }}
                      loading="lazy"
                    />
                    {annotationMode && rightOpt && (
                      <AnnotationsOverlay
                        annotations={rightAnnotations}
                        mediaWidth={mediaDimensions.width || 800}
                        mediaHeight={mediaDimensions.height || 600}
                        onAdd={
                          onAnnotate
                            ? handleAddAnnotation(rightOpt, rightMediaId)
                            : undefined
                        }
                        readOnly={!annotationMode}
                      />
                    )}
                  </div>
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
                type="button"
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
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
