/**
 * Visual Side-by-Side Viewer types
 * Annotation types, asset types, layout config
 */

export type AnnotationType = 'text' | 'shape' | 'freehand'

export type ShapeType = 'point' | 'rectangle' | 'polygon' | 'ellipse'

export type AssetType = 'image' | 'BIM' | 'PDF' | 'CAD' | 'other'

export interface AnnotationCoordinates {
  x: number
  y: number
  width?: number
  height?: number
  points?: Array<{ x: number; y: number }>
}

export interface AnnotationData {
  coordinates: AnnotationCoordinates
  shape?: ShapeType
  text?: string
  color?: string
  stroke?: number
  font?: string
}

export interface ViewerAnnotation {
  id: string
  decisionId: string
  optionId: string
  assetId: string
  type: AnnotationType
  data: AnnotationData
  authorId?: string | null
  authorName?: string | null
  createdAt: string
  updatedAt: string
}

export interface ViewerAsset {
  id: string
  type: AssetType
  url: string
  thumbnailUrl?: string
  fileName?: string
  size?: number
  forgeAssetId?: string | null
}

export type ViewerLayout = '2-up' | '3-up' | '4-up' | 'adaptive'

export interface ViewerOptions {
  layout?: ViewerLayout
  syncZoom?: boolean
  syncPan?: boolean
  enableAnnotations?: boolean
  enableDeepZoom?: boolean
}
