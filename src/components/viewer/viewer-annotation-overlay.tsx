/**
 * ViewerAnnotationOverlay - Annotations layer for viewer panes
 * Supports text, shapes (point, rectangle, polygon), freehand
 * Renders in normalized coordinates (0-1) for zoom/pan independence
 */

import { useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ViewerAnnotation, AnnotationData } from '@/types/viewer'

export interface ViewerAnnotationOverlayProps {
  annotations: ViewerAnnotation[]
  containerWidth: number
  containerHeight: number
  onAdd?: (data: {
    type: 'text' | 'shape' | 'freehand'
    data: AnnotationData
  }) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, data: AnnotationData) => void
  readOnly?: boolean
  className?: string
}

function toPercent(
  coords: { x: number; y: number; width?: number; height?: number; points?: Array<{ x: number; y: number }> },
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

export function ViewerAnnotationOverlay({
  annotations,
  containerWidth,
  containerHeight,
  onAdd,
  onDelete,
  readOnly = false,
  className,
}: ViewerAnnotationOverlayProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (readOnly || !onAdd) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * (containerWidth || 1)
      const y = ((e.clientY - rect.top) / rect.height) * (containerHeight || 1)
      onAdd({
        type: 'shape',
        data: {
          coordinates: { x, y },
          shape: 'point',
          color: 'rgb(var(--primary))',
        },
      })
    },
    [onAdd, readOnly, containerWidth, containerHeight]
  )

  const w = containerWidth || 800
  const h = containerHeight || 600

  return (
    <div
      className={cn('absolute inset-0', className)}
      onMouseDown={handleMouseDown}
      role="img"
      aria-label="Annotations overlay"
    >
      {annotations.map((ann) => {
        const coords = ann.data?.coordinates ?? { x: 0, y: 0 }
        const pct = toPercent(coords, w, h)
        const isPoint = ann.type === 'text' || (ann.data?.shape === 'point' || (!coords.width && !coords.height))

        return (
          <div
            key={ann.id}
            className={cn(
              'absolute border-2',
              !readOnly && onDelete && 'group cursor-pointer'
            )}
            style={{
              left: pct.left,
              top: pct.top,
              width: pct.width ?? (isPoint ? '12px' : undefined),
              height: pct.height ?? (isPoint ? '12px' : undefined),
              marginLeft: isPoint ? '-6px' : undefined,
              marginTop: isPoint ? '-6px' : undefined,
              borderColor: ann.data?.color ?? 'rgb(var(--primary))',
              backgroundColor: ann.data?.color ? `${ann.data.color}30` : 'rgba(25, 92, 74, 0.2)',
              borderRadius: isPoint ? '50%' : '4px',
            }}
            title={ann.data?.text ?? ann.authorName ?? 'Annotation'}
          >
            {ann.data?.text && (
              <span className="block truncate px-1 py-0.5 text-xs font-medium">
                {ann.data.text}
              </span>
            )}
            {!readOnly && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(ann.id)
                }}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Remove annotation"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
