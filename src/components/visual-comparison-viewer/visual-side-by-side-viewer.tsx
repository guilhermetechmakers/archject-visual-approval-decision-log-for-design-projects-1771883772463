import { useState, useCallback, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PenLine,
  Lock,
  Unlock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageViewerPane } from './image-viewer-pane'
import { cn } from '@/lib/utils'
import type { VisualSideBySideViewerProps } from '@/types/visual-comparison'

export function VisualSideBySideViewer({
  options,
  annotations = [],
  layout = 'adaptive',
  syncPanZoom = true,
  annotationMode: initialAnnotationMode = false,
  canAnnotate = false,
  selectedOptionId,
  onSelectOption,
  onAnnotate,
  onDeleteAnnotation,
  accentColor = 'rgb(var(--primary))',
  className,
  showThumbnails = true,
}: VisualSideBySideViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [annotationMode, setAnnotationMode] = useState(initialAnnotationMode)
  const [swipeStart, setSwipeStart] = useState<number | null>(null)
  const [paneZooms, setPaneZooms] = useState<Record<number, number>>({})
  const [panePans, setPanePans] = useState<Record<number, { x: number; y: number }>>({})

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  useEffect(() => {
    if (layout !== 'adaptive') return
    const update = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [layout])

  const paneCount =
    typeof layout === 'number'
      ? Math.min(layout, 4)
      : layout === 'adaptive'
        ? (windowWidth < 768 ? 2 : 4)
        : 4
  const visibleOptions = options.slice(activeIndex, activeIndex + paneCount)
  const canPrev = activeIndex > 0
  const canNext = activeIndex + paneCount < options.length

  const syncState = syncPanZoom ? { zoom, pan } : undefined

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + 0.25, 4)
    setZoom(newZoom)
    if (syncPanZoom) {
      setPaneZooms({})
      setPanePans({})
    }
  }, [zoom, syncPanZoom])

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - 0.25, 0.5)
    setZoom(newZoom)
    if (syncPanZoom) {
      setPaneZooms({})
      setPanePans({})
    }
  }, [zoom, syncPanZoom])

  const handleZoomChange = useCallback(
    (paneIndex: number) => (newZoom: number) => {
      if (syncPanZoom) {
        setZoom(newZoom)
        setPaneZooms({})
        setPanePans({})
      } else {
        setPaneZooms((prev) => ({ ...prev, [paneIndex]: newZoom }))
      }
    },
    [syncPanZoom]
  )

  const handlePanChange = useCallback(
    (paneIndex: number) => (newPan: { x: number; y: number }) => {
      if (syncPanZoom) {
        setPan(newPan)
        setPanePans({})
      } else {
        setPanePans((prev) => ({ ...prev, [paneIndex]: newPan }))
      }
    },
    [syncPanZoom]
  )

  const handlePrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1))
  }, [])

  const handleNext = useCallback(() => {
    setActiveIndex((i) =>
      Math.min(Math.max(0, options.length - paneCount), i + 1)
    )
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

  const handleResetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setPaneZooms({})
    setPanePans({})
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key) {
        case 'ArrowLeft':
          handlePrev()
          break
        case 'ArrowRight':
          handleNext()
          break
        case '+':
        case '=':
          e.preventDefault()
          handleZoomIn()
          break
        case '-':
          e.preventDefault()
          handleZoomOut()
          break
        case '0':
          e.preventDefault()
          handleResetView()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext, handleZoomIn, handleZoomOut, handleResetView])

  const getPaneZoom = (i: number) => paneZooms[i] ?? zoom
  const getPanePan = (i: number) => panePans[i] ?? pan

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
      role="region"
      aria-label="Visual side-by-side comparison viewer"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">
          Visual comparison
        </span>
        <div className="flex items-center gap-1">
          {canAnnotate && (
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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleResetView}
            aria-label="Reset view"
            title="Reset zoom and pan (or press 0)"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          {syncPanZoom ? (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Sync pan/zoom across panes"
              aria-label="Sync enabled"
            >
              <Lock className="h-4 w-4 text-primary" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Independent pan/zoom per pane"
              aria-label="Sync disabled"
            >
              <Unlock className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      <div
        className="relative flex min-h-[280px] flex-col md:min-h-[360px] md:flex-row"
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
            <div
              className={cn(
                'flex flex-1 gap-2 p-4',
                paneCount === 2 && 'flex-col md:flex-row',
                paneCount === 3 && 'flex-col md:flex-row',
                paneCount === 4 && 'grid grid-cols-1 gap-2 md:grid-cols-2'
              )}
            >
              {visibleOptions.map((opt, i) => (
                <ImageViewerPane
                  key={opt.id}
                  optionId={opt.id}
                  mediaId={opt.mediaId ?? opt.id}
                  title={opt.title}
                  imageUrl={opt.mediaUrl}
                  annotations={annotations.filter(
                    (a) => a.optionId === opt.id && a.mediaId === (opt.mediaId ?? opt.id)
                  )}
                  zoom={getPaneZoom(activeIndex + i)}
                  pan={getPanePan(activeIndex + i)}
                  onZoomChange={handleZoomChange(activeIndex + i)}
                  onPanChange={handlePanChange(activeIndex + i)}
                  syncFrom={syncState}
                  syncPanZoom={syncPanZoom}
                  annotationMode={annotationMode}
                  canAnnotate={canAnnotate && !!onAnnotate}
                  onAnnotate={
                    onAnnotate
                      ? (data) =>
                          onAnnotate(opt.id, opt.mediaId ?? opt.id, {
                            ...data,
                            shape: data.shape as 'point' | 'rectangle' | 'area' | 'freehand',
                          })
                      : undefined
                  }
                  onDeleteAnnotation={onDeleteAnnotation}
                  accentColor={accentColor}
                  className={cn(
                    paneCount === 2 && 'min-h-[200px] md:min-h-[280px]',
                    paneCount >= 3 && 'min-h-[180px] md:min-h-[240px]'
                  )}
                >
                  {onSelectOption && (
                    <div className="absolute right-2 top-2 z-10">
                      <Button
                        variant={selectedOptionId === opt.id ? 'default' : 'secondary'}
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
                    </div>
                  )}
                </ImageViewerPane>
              ))}
            </div>

            {(canPrev || canNext) && (
              <>
                {canPrev && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 shadow-md md:left-4"
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
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 shadow-md md:right-4"
                    onClick={handleNext}
                    aria-label="Next comparison"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>

      {showThumbnails && options.length >= 2 && (
        <div className="flex items-center justify-center gap-2 border-t border-border px-4 py-3">
          <div className="flex flex-wrap justify-center gap-1">
            {options.map((opt, i) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActiveIndex(Math.max(0, Math.min(i, options.length - paneCount)))}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                  i >= activeIndex && i < activeIndex + paneCount
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary'
                )}
                aria-label={`View ${opt.title}`}
                aria-pressed={i >= activeIndex && i < activeIndex + paneCount}
              >
                {opt.thumbnailUrl ?? opt.mediaUrl ? (
                  <img
                    src={opt.thumbnailUrl ?? opt.mediaUrl ?? ''}
                    alt=""
                    className="h-6 w-8 rounded object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-8 items-center justify-center rounded bg-secondary text-[10px]">
                    {i + 1}
                  </span>
                )}
                <span className="hidden sm:inline">{opt.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {options.length >= 2 && !showThumbnails && (
        <div className="flex justify-center gap-1 border-t border-border px-4 py-2">
          {Array.from({
            length: Math.max(1, Math.ceil(options.length / paneCount)),
          }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i * paneCount)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
                i === Math.floor(activeIndex / paneCount)
                  ? 'bg-primary'
                  : 'bg-border hover:bg-muted-foreground/30'
              )}
              aria-label={`View comparison ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
