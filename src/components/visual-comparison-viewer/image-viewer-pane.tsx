import { useCallback, useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ComparisonAnnotation } from '@/types/visual-comparison'

export interface ImageViewerPaneProps {
  optionId?: string
  mediaId?: string
  title: string
  imageUrl: string | null
  annotations: ComparisonAnnotation[]
  zoom: number
  pan: { x: number; y: number }
  onZoomChange?: (zoom: number) => void
  onPanChange?: (pan: { x: number; y: number }) => void
  syncFrom?: { zoom: number; pan: { x: number; y: number } }
  syncPanZoom?: boolean
  annotationMode?: boolean
  canAnnotate?: boolean
  onAnnotate?: (data: {
    shape: 'point' | 'rectangle' | 'area' | 'freehand'
    coordinates: { x: number; y: number; width?: number; height?: number }
    points?: [number, number][]
    note?: string
    color?: string
  }) => void
  onDeleteAnnotation?: (id: string) => void
  accentColor?: string
  className?: string
  children?: React.ReactNode
}

function toPercent(
  coords: { x: number; y: number; width?: number; height?: number },
  imgW: number,
  imgH: number
) {
  if (imgW <= 0 || imgH <= 0) {
    return { left: '0%', top: '0%', width: undefined, height: undefined }
  }
  return {
    left: `${(coords.x / imgW) * 100}%`,
    top: `${(coords.y / imgH) * 100}%`,
    width: coords.width != null ? `${(coords.width / imgW) * 100}%` : undefined,
    height: coords.height != null ? `${(coords.height / imgH) * 100}%` : undefined,
  }
}

export function ImageViewerPane({
  optionId: _optionId,
  mediaId: _mediaId,
  title,
  imageUrl,
  annotations,
  zoom,
  pan,
  onZoomChange,
  onPanChange,
  syncFrom,
  syncPanZoom,
  annotationMode,
  canAnnotate,
  onAnnotate,
  onDeleteAnnotation,
  accentColor = 'rgb(var(--primary))',
  className,
  children,
}: ImageViewerPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mediaDimensions, setMediaDimensions] = useState({ width: 800, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 })
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [freehandPoints, setFreehandPoints] = useState<[number, number][]>([])

  useEffect(() => {
    if (syncPanZoom && syncFrom) {
      onZoomChange?.(syncFrom.zoom)
      onPanChange?.(syncFrom.pan)
    }
  }, [syncPanZoom, syncFrom?.zoom, syncFrom?.pan.x, syncFrom?.pan.y])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newZoom = Math.max(0.5, Math.min(4, zoom + delta))
      onZoomChange?.(newZoom)
    },
    [zoom, onZoomChange]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (annotationMode && canAnnotate && onAnnotate) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = ((e.clientX - rect.left) / rect.width) * mediaDimensions.width
        const y = ((e.clientY - rect.top) / rect.height) * mediaDimensions.height
        setDrawStart({ x, y })
        setIsDrawing(true)
        setFreehandPoints([[x, y]])
      } else {
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y })
      }
    },
    [annotationMode, canAnnotate, onAnnotate, pan, mediaDimensions]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y
        onPanChange?.({ x: dragStart.panX + dx, y: dragStart.panY + dy })
      } else if (isDrawing && drawStart && onAnnotate) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const x = ((e.clientX - rect.left) / rect.width) * mediaDimensions.width
        const y = ((e.clientY - rect.top) / rect.height) * mediaDimensions.height
        setFreehandPoints((prev) => [...prev, [x, y]])
      }
    },
    [isDragging, dragStart, isDrawing, drawStart, onPanChange, onAnnotate, mediaDimensions]
  )

  const handleMouseUp = useCallback(() => {
    if (isDrawing && drawStart && onAnnotate) {
      const pts = freehandPoints
      if (pts.length >= 2) {
        const last = pts[pts.length - 1]
        const dx = Math.abs(last[0] - drawStart.x)
        const dy = Math.abs(last[1] - drawStart.y)
        if (dx > 10 || dy > 10) {
          onAnnotate({
            shape: 'rectangle',
            coordinates: {
              x: Math.min(drawStart.x, last[0]),
              y: Math.min(drawStart.y, last[1]),
              width: dx,
              height: dy,
            },
            color: accentColor,
          })
        } else {
          onAnnotate({
            shape: 'point',
            coordinates: { x: drawStart.x, y: drawStart.y },
            color: accentColor,
          })
        }
      } else if (pts.length === 1) {
        onAnnotate({
          shape: 'point',
          coordinates: { x: drawStart.x, y: drawStart.y },
          color: accentColor,
        })
      }
      setIsDrawing(false)
      setDrawStart(null)
      setFreehandPoints([])
    }
    setIsDragging(false)
  }, [isDrawing, drawStart, freehandPoints, onAnnotate, accentColor])

  const handleMouseLeave = useCallback(() => {
    if (isDrawing && drawStart && onAnnotate) {
      const pts = freehandPoints
      if (pts.length >= 2) {
        const last = pts[pts.length - 1]
        const dx = Math.abs(last[0] - drawStart.x)
        const dy = Math.abs(last[1] - drawStart.y)
        if (dx > 10 || dy > 10) {
          onAnnotate({
            shape: 'rectangle',
            coordinates: {
              x: Math.min(drawStart.x, last[0]),
              y: Math.min(drawStart.y, last[1]),
              width: dx,
              height: dy,
            },
            color: accentColor,
          })
        } else {
          onAnnotate({
            shape: 'point',
            coordinates: { x: drawStart.x, y: drawStart.y },
            color: accentColor,
          })
        }
      }
    }
    setIsDrawing(false)
    setDrawStart(null)
    setFreehandPoints([])
    setIsDragging(false)
  }, [isDrawing, drawStart, freehandPoints, onAnnotate, accentColor])

  const handleDoubleClick = useCallback(() => {
    onZoomChange?.(1)
    onPanChange?.({ x: 0, y: 0 })
  }, [onZoomChange, onPanChange])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (annotationMode && canAnnotate && onAnnotate) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const t = e.touches[0]
        const x = ((t.clientX - rect.left) / rect.width) * mediaDimensions.width
        const y = ((t.clientY - rect.top) / rect.height) * mediaDimensions.height
        setDrawStart({ x, y })
        setIsDrawing(true)
        setFreehandPoints([[x, y]])
      } else {
        const t = e.touches[0]
        setIsDragging(true)
        setDragStart({ x: t.clientX, y: t.clientY, panX: pan.x, panY: pan.y })
      }
    },
    [annotationMode, canAnnotate, onAnnotate, pan, mediaDimensions]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDrawing && drawStart && onAnnotate) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const t = e.touches[0]
        const x = ((t.clientX - rect.left) / rect.width) * mediaDimensions.width
        const y = ((t.clientY - rect.top) / rect.height) * mediaDimensions.height
        setFreehandPoints((prev) => [...prev, [x, y]])
      } else if (isDragging) {
        const t = e.touches[0]
        const dx = t.clientX - dragStart.x
        const dy = t.clientY - dragStart.y
        onPanChange?.({ x: dragStart.panX + dx, y: dragStart.panY + dy })
      }
    },
    [isDragging, dragStart, isDrawing, drawStart, onPanChange, onAnnotate, mediaDimensions]
  )

  const handleTouchEnd = useCallback(() => {
    if (isDrawing && drawStart && onAnnotate && freehandPoints.length >= 1) {
      const pts = freehandPoints
      if (pts.length >= 2) {
        const last = pts[pts.length - 1]
        const dx = Math.abs(last[0] - drawStart.x)
        const dy = Math.abs(last[1] - drawStart.y)
        if (dx > 10 || dy > 10) {
          onAnnotate({
            shape: 'rectangle',
            coordinates: {
              x: Math.min(drawStart.x, last[0]),
              y: Math.min(drawStart.y, last[1]),
              width: dx,
              height: dy,
            },
            color: accentColor,
          })
        } else {
          onAnnotate({
            shape: 'point',
            coordinates: { x: drawStart.x, y: drawStart.y },
            color: accentColor,
          })
        }
      } else {
        onAnnotate({
          shape: 'point',
          coordinates: { x: drawStart.x, y: drawStart.y },
          color: accentColor,
        })
      }
    }
    setIsDrawing(false)
    setDrawStart(null)
    setFreehandPoints([])
    setIsDragging(false)
  }, [isDrawing, drawStart, freehandPoints, onAnnotate, accentColor])

  const imgW = mediaDimensions.width
  const imgH = mediaDimensions.height

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-secondary/30',
        (isDragging || isDrawing) && 'cursor-grabbing',
        className
      )}
    >
      <div className="border-b border-border px-4 py-2 text-sm font-medium">{title}</div>
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        {imageUrl ? (
          <>
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <img
                src={imageUrl}
                alt={title}
                className="max-h-full max-w-full select-none object-contain"
                draggable={false}
                loading="lazy"
                onLoad={(e) => {
                  const img = e.currentTarget
                  if (img.naturalWidth && img.naturalHeight) {
                    setMediaDimensions({ width: img.naturalWidth, height: img.naturalHeight })
                  }
                }}
              />
            </div>
            {(annotationMode || annotations.length > 0) && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: annotationMode && canAnnotate ? 'auto' : 'none' }}
              >
                <div
                  className="relative h-full w-full"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                >
                  {annotations.map((ann) => {
                    const pct = toPercent(ann.coordinates, imgW, imgH)
                    const isPoint = ann.shape === 'point'
                    const isFreehand = ann.shape === 'freehand'

                    if (isFreehand && ann.points && ann.points.length >= 2) {
                      const pathD = ann.points
                        .map((p, i) =>
                          i === 0
                            ? `M ${(p[0] / imgW) * 100} ${(p[1] / imgH) * 100}`
                            : `L ${(p[0] / imgW) * 100} ${(p[1] / imgH) * 100}`
                        )
                        .join(' ')
                      return (
                        <svg
                          key={ann.id}
                          className="absolute inset-0 h-full w-full"
                          viewBox={`0 0 100 100`}
                          preserveAspectRatio="none"
                          style={{ overflow: 'visible' }}
                        >
                          <path
                            d={pathD}
                            fill="none"
                            stroke={ann.color ?? accentColor}
                            strokeWidth={1}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )
                    }

                    return (
                      <div
                        key={ann.id}
                        className={cn(
                          'absolute border-2 group',
                          !annotationMode && 'cursor-default',
                          isPoint &&
                            'h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full'
                        )}
                        style={{
                          left: pct.left,
                          top: pct.top,
                          width: pct.width ?? (isPoint ? undefined : '8px'),
                          height: pct.height ?? (isPoint ? undefined : '8px'),
                          borderColor: ann.color ?? accentColor,
                          backgroundColor: ann.color ? `${ann.color}40` : 'rgba(25,92,74,0.25)',
                        }}
                        title={ann.note}
                      >
                        {annotationMode && onDeleteAnnotation && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteAnnotation(ann.id)
                            }}
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                            aria-label="Remove annotation"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )
                  })}
                  {isDrawing && freehandPoints.length >= 2 && (
                    <svg
                      className="absolute inset-0 h-full w-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      style={{ overflow: 'visible' }}
                    >
                      <path
                        d={freehandPoints
                          .map((p, i) =>
                            i === 0
                              ? `M ${(p[0] / imgW) * 100} ${(p[1] / imgH) * 100}`
                              : `L ${(p[0] / imgW) * 100} ${(p[1] / imgH) * 100}`
                          )
                          .join(' ')}
                        fill="none"
                        stroke={accentColor}
                        strokeWidth={1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary">
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-sm">No media</span>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
