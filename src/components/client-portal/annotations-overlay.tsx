import { useCallback, useState } from 'react'
import { X, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ClientPortalAnnotation } from '@/types/client-portal'

export interface AnnotationsOverlayProps {
  annotations: ClientPortalAnnotation[]
  mediaWidth: number
  mediaHeight: number
  onAdd?: (data: {
    shape: 'point' | 'rectangle' | 'area'
    coordinates: { x: number; y: number; width?: number; height?: number }
    note?: string
    color?: string
  }) => void
  onDelete?: (id: string) => void
  onExport?: () => void
  readOnly?: boolean
  className?: string
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

export function AnnotationsOverlay({
  annotations,
  mediaWidth,
  mediaHeight,
  onAdd,
  onDelete,
  onExport,
  readOnly = false,
  className,
}: AnnotationsOverlayProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(
    null
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (readOnly || !onAdd) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setDrawStart({ x, y })
      setIsDrawing(true)
    },
    [onAdd, readOnly]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDrawing || !drawStart || !onAdd) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const dx = Math.abs(x - drawStart.x)
      const dy = Math.abs(y - drawStart.y)
      const shape = dx > 10 || dy > 10 ? 'rectangle' : 'point'
      onAdd({
        shape,
        coordinates:
          shape === 'point'
            ? { x: drawStart.x, y: drawStart.y }
            : {
                x: Math.min(drawStart.x, x),
                y: Math.min(drawStart.y, y),
                width: dx,
                height: dy,
              },
        color: '#ef4444',
      })
      setIsDrawing(false)
      setDrawStart(null)
    },
    [isDrawing, drawStart, onAdd]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (readOnly || !onAdd) return
      const rect = e.currentTarget.getBoundingClientRect()
      const touch = e.touches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      setDrawStart({ x, y })
      setIsDrawing(true)
    },
    [onAdd, readOnly]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!isDrawing || !drawStart || !onAdd) return
      const rect = e.currentTarget.getBoundingClientRect()
      const touch = e.changedTouches[0]
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      const dx = Math.abs(x - drawStart.x)
      const dy = Math.abs(y - drawStart.y)
      const shape = dx > 10 || dy > 10 ? 'rectangle' : 'point'
      onAdd({
        shape,
        coordinates:
          shape === 'point'
            ? { x: drawStart.x, y: drawStart.y }
            : {
                x: Math.min(drawStart.x, x),
                y: Math.min(drawStart.y, y),
                width: dx,
                height: dy,
              },
        color: '#ef4444',
      })
      setIsDrawing(false)
      setDrawStart(null)
    },
    [isDrawing, drawStart, onAdd]
  )

  if (mediaWidth <= 0 || mediaHeight <= 0) return null

  return (
    <div
      className={cn('relative', className)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsDrawing(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="img"
      aria-label="Media with annotations"
    >
      {annotations.map((ann) => {
        const pct = toPercent(
          ann.coordinates,
          mediaWidth,
          mediaHeight
        )
        const isPoint = ann.shape === 'point'

        return (
          <div
            key={ann.id}
            className={cn(
              'absolute border-2',
              !readOnly && 'group cursor-pointer',
              isPoint ? 'h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full' : 'rounded'
            )}
            style={{
              left: pct.left,
              top: pct.top,
              width: pct.width ?? '8px',
              height: pct.height ?? '8px',
              borderColor: ann.color ?? 'rgb(239 68 68)',
              backgroundColor: ann.color ? `${ann.color}40` : 'rgba(239,68,68,0.25)',
            }}
            title={ann.note}
          >
            {!readOnly && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(ann.id)
                }}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                aria-label="Remove annotation"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )
      })}
      {!readOnly && (onAdd || onExport) && (
        <div className="absolute right-2 top-2 flex gap-1">
          {onExport && (
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={onExport}
              className="h-8 w-8 shadow-md"
              aria-label="Export annotations"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
