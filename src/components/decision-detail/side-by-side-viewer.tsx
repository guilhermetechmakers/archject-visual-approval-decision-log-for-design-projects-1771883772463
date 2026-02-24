/**
 * SideBySideViewer - Decision Detail internal viewer
 * Wraps VisualSideBySideViewer with DecisionOption/annotation mapping
 */

import {
  VisualSideBySideViewer,
  toComparisonOptions,
  toComparisonAnnotations,
} from '@/components/visual-comparison-viewer'
import type { DecisionOption } from '@/types/decision-detail'

export interface SideBySideViewerProps {
  options: DecisionOption[]
  annotations?: Array<{
    id: string
    mediaId: string
    optionId?: string
    type: string
    data?: {
      coordinates?: { x: number; y: number; width?: number; height?: number }
      points?: [number, number][]
    }
    createdBy?: string | null
    createdAt: string
  }>
  decisionId?: string
  enableAnnotations?: boolean
  onAnnotate?: (
    optionId: string,
    mediaId: string,
    data: {
      type: 'text' | 'shape' | 'freehand'
      data: {
        coordinates: { x: number; y: number; width?: number; height?: number }
        text?: string
        color?: string
      }
    }
  ) => void
  onDeleteAnnotation?: (id: string) => void
  className?: string
}

export function SideBySideViewer({
  options,
  annotations = [],
  enableAnnotations = false,
  onAnnotate,
  onDeleteAnnotation,
  className,
}: SideBySideViewerProps) {
  const comparisonOptions = toComparisonOptions(options)
  const comparisonAnnotations = toComparisonAnnotations(
    annotations.map((a) => ({
      id: a.id,
      mediaId: a.mediaId,
      optionId: a.optionId,
      type: a.type,
      data: a.data,
      createdAt: a.createdAt,
    })),
    options
  )

  return (
    <VisualSideBySideViewer
      options={comparisonOptions}
      annotations={comparisonAnnotations}
      layout="adaptive"
      syncPanZoom
      canAnnotate={enableAnnotations}
      onAnnotate={
        onAnnotate
          ? (optionId, mediaId, data) =>
              onAnnotate(optionId, mediaId, {
                type: data.shape === 'freehand' ? 'freehand' : 'shape',
                data: {
                  coordinates: data.coordinates,
                  color: data.color,
                },
              })
          : undefined
      }
      onDeleteAnnotation={onDeleteAnnotation}
      className={className}
    />
  )
}
