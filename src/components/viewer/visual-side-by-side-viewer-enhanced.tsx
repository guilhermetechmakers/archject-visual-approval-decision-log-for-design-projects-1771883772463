/**
 * Visual Side-by-Side Viewer (Enhanced)
 * Deep-zoom, synchronized pan/zoom, 2-4 up layout, annotations, keyboard nav
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PenLine,
  Share2,
  Link2,
  Link2Off,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeepZoomViewer } from './deep-zoom-viewer'
import { ViewerAnnotationOverlay } from './viewer-annotation-overlay'
import { cn } from '@/lib/utils'
import type { ViewerAnnotation, AnnotationData } from '@/types/viewer'

export interface ViewerOption {
  id: string
  title: string
  mediaUrl?: string | null
  mediaId?: string
  thumbnailUrl?: string | null
}

export interface VisualSideBySideViewerEnhancedProps {
  options: ViewerOption[]
  annotations?: ViewerAnnotation[]
  layout?: '2-up' | '3-up' | '4-up' | 'adaptive'
  syncZoom?: boolean
  syncPan?: boolean
  enableAnnotations?: boolean
  enableDeepZoom?: boolean
  selectedOptionId?: string | null
  onSelectOption?: (optionId: string) => void
  onAnnotate?: (
    optionId: string,
    mediaId: string,
    data: { type: 'text' | 'shape' | 'freehand'; data: AnnotationData }
  ) => void
  onDeleteAnnotation?: (id: string) => void
  onShare?: (optionId: string) => void
  accentColor?: string
  className?: string
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

export function VisualSideBySideViewerEnhanced({
  options,
  annotations = [],
  layout = '2-up',
  syncZoom = true,
  syncPan = true,
  enableAnnotations = false,
  enableDeepZoom = true,
  selectedOptionId,
  onSelectOption,
  onAnnotate,
  onDeleteAnnotation,
  onShare,
  accentColor = 'rgb(var(--primary))',
  className,
}: VisualSideBySideViewerEnhancedProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [swipeStart, setSwipeStart] = useState<number | null>(null)
  const [annotationMode, setAnnotationMode] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(syncZoom || syncPan)
  const [mediaDimensions, setMediaDimensions] = useState({ width: 800, height: 600 })
  const imgRef = useRef<HTMLImageElement>(null)

  const paneCount = layout === '2-up' ? 2 : layout === '3-up' ? 3 : layout === '4-up' ? 4 : 2
  const visibleOptions = options.slice(activeIndex, activeIndex + paneCount)

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
    setActiveIndex((i) => Math.min(Math.max(0, options.length - paneCount), i + 1))
  }, [options.length, paneCount])

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-') {
        e.preventDefault()
        handleZoomOut()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext, handleZoomIn, handleZoomOut])

  const handleImageLoad = useCallback(() => {
    const img = imgRef.current
    if (img?.naturalWidth && img?.naturalHeight) {
      setMediaDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
  }, [])

  const canPrev = activeIndex > 0
  const canNext = activeIndex < Math.max(0, options.length - paneCount)

  const handleAddAnnotation = useCallback(
    (opt: ViewerOption, mediaId: string) =>
      (data: { type: 'text' | 'shape' | 'freehand'; data: AnnotationData }) => {
        if (!onAnnotate) return
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
          {enableAnnotations && (
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
          )}
          {(syncZoom || syncPan) && (
            <Button
              variant={syncEnabled ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => setSyncEnabled(!syncEnabled)}
              aria-label={syncEnabled ? 'Sync off' : 'Sync on'}
              style={syncEnabled ? { backgroundColor: accentColor } : undefined}
            >
              {syncEnabled ? (
                <Link2 className="h-4 w-4" />
              ) : (
                <Link2Off className="h-4 w-4" />
              )}
            </Button>
          )}
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
        className={cn(
          'relative grid min-h-[280px] md:min-h-[360px]',
          paneCount === 2 && 'grid-cols-2',
          paneCount === 3 && 'grid-cols-3',
          paneCount === 4 && 'grid-cols-4'
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {options.length < 2 ? (
          <div className="col-span-full flex flex-1 items-center justify-center p-8">
            <p className="text-muted-foreground">
              Add at least 2 options to compare side-by-side
            </p>
          </div>
        ) : (
          visibleOptions.map((opt, idx) => {
            const mediaUrl = opt.mediaUrl
            const mediaId = opt.mediaId ?? opt.id
            const optionAnnotations = annotations.filter(
              (a) => a.optionId === opt.id && a.assetId === mediaId
            )

            return (
              <div
                key={opt.id}
                className={cn(
                  'flex flex-col border-border',
                  idx > 0 && 'border-l'
                )}
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-2">
                  <span className="text-sm font-medium truncate">
                    {opt.title ?? `Option ${idx + 1}`}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    {onSelectOption && (
                      <Button
                        variant={selectedOptionId === opt.id ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onSelectOption(opt.id)}
                        style={
                          selectedOptionId === opt.id
                            ? { backgroundColor: accentColor }
                            : undefined
                        }
                      >
                        Select
                      </Button>
                    )}
                    {onShare && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onShare(opt.id)}
                        aria-label="Share option"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-secondary/30 p-4">
                  {mediaUrl ? (
                    enableDeepZoom ? (
                      <div className="relative h-full w-full">
                        <DeepZoomViewer
                          imageUrl={mediaUrl}
                          minHeight={280}
                          className="h-full w-full"
                        >
                          {annotationMode && enableAnnotations && (
                            <ViewerAnnotationOverlay
                              annotations={optionAnnotations}
                              containerWidth={mediaDimensions.width}
                              containerHeight={mediaDimensions.height}
                              onAdd={onAnnotate ? handleAddAnnotation(opt, mediaId) : undefined}
                              onDelete={onDeleteAnnotation}
                              readOnly={!annotationMode}
                            />
                          )}
                        </DeepZoomViewer>
                      </div>
                    ) : (
                      <div className="relative flex h-full w-full items-center justify-center">
                        <img
                          ref={idx === 0 ? imgRef : undefined}
                          src={mediaUrl}
                          alt={opt.title ?? 'Option'}
                          className="max-h-full max-w-full object-contain transition-transform duration-200"
                          style={{ transform: `scale(${zoom})` }}
                          onLoad={idx === 0 ? handleImageLoad : undefined}
                          loading="lazy"
                        />
                        {annotationMode && enableAnnotations && (
                          <ViewerAnnotationOverlay
                            annotations={optionAnnotations}
                            containerWidth={mediaDimensions.width}
                            containerHeight={mediaDimensions.height}
                            onAdd={onAnnotate ? handleAddAnnotation(opt, mediaId) : undefined}
                            onDelete={onDeleteAnnotation}
                            readOnly={!annotationMode}
                          />
                        )}
                      </div>
                    )
                  ) : (
                    <PlaceholderMedia />
                  )}
                </div>
              </div>
            )
          })
        )}

        {options.length >= 2 && (
          <>
            {canPrev && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 shadow-md md:left-4 z-10"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 shadow-md md:right-4 z-10"
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
          {Array.from({ length: Math.max(1, options.length - paneCount + 1) }).map(
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
