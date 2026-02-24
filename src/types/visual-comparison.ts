/**
 * Shared types for Visual Side-by-Side Comparison Viewer
 * Works with both DecisionOption (internal) and ClientPortalOption (client portal)
 */

export type AnnotationShape = 'point' | 'rectangle' | 'area' | 'polygon' | 'freehand'

export interface ComparisonMediaAsset {
  id: string
  type: 'image' | 'pdf' | 'render' | 'BIM' | 'other'
  url: string
  thumbnailUrl?: string
  /** DZI or IIIF tile source URL for deep-zoom; when set, OpenSeadragon is used */
  tileSourceUrl?: string
  metadata?: Record<string, unknown>
}

export interface ComparisonOption {
  id: string
  title: string
  description?: string | null
  /** Primary media URL for display */
  mediaUrl: string | null
  /** Media asset ID for annotations */
  mediaId: string | null
  /** Thumbnail URL for strip */
  thumbnailUrl?: string | null
  /** Full assets list (for multi-asset options) */
  assets: ComparisonMediaAsset[]
}

export interface ComparisonAnnotation {
  id: string
  optionId: string
  mediaId: string
  shape: AnnotationShape
  coordinates: { x: number; y: number; width?: number; height?: number }
  /** For freehand: array of [x,y] points */
  points?: [number, number][]
  note?: string
  color?: string
  createdAt: string
  authorName?: string
}

export interface VisualSideBySideViewerProps {
  options: ComparisonOption[]
  annotations?: ComparisonAnnotation[]
  /** Layout: 2, 3, or 4 panes; 'adaptive' uses 2 on mobile, up to 4 on desktop */
  layout?: 2 | 3 | 4 | 'adaptive'
  /** Sync pan/zoom across panes */
  syncPanZoom?: boolean
  /** Enable annotation mode */
  annotationMode?: boolean
  canAnnotate?: boolean
  selectedOptionId?: string | null
  onSelectOption?: (optionId: string) => void
  onAnnotate?: (
    optionId: string,
    mediaId: string,
    data: {
      shape: AnnotationShape
      coordinates: { x: number; y: number; width?: number; height?: number }
      points?: [number, number][]
      note?: string
      color?: string
    }
  ) => void
  onDeleteAnnotation?: (annotationId: string) => void
  accentColor?: string
  className?: string
  /** Show thumbnail strip */
  showThumbnails?: boolean
}
