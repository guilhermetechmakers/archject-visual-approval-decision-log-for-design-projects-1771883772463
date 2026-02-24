/**
 * VisualSideBySideViewer - Client Portal viewer
 * Wraps enhanced viewer with ClientPortalOption/ClientPortalAnnotation mapping
 */

import {
  VisualSideBySideViewerEnhanced,
  type ViewerOption,
} from '@/components/viewer'
import type {
  ClientPortalOption,
  ClientPortalAnnotation,
  MediaAsset,
} from '@/types/client-portal'
import type { ViewerAnnotation } from '@/types/viewer'

function getFirstMediaUrl(opt: ClientPortalOption): string | null {
  const first = opt.mediaAssets[0] ?? opt.mediaUrls?.[0]
  return typeof first === 'string' ? first : (first as MediaAsset)?.url ?? null
}

function getFirstMediaId(opt: ClientPortalOption): string {
  const first = opt.mediaAssets[0]
  return (first as MediaAsset)?.id ?? opt.id
}

function mapToViewerOptions(options: ClientPortalOption[]): ViewerOption[] {
  return options.map((opt) => ({
    id: opt.id,
    title: opt.title,
    mediaUrl: getFirstMediaUrl(opt),
    mediaId: getFirstMediaId(opt),
    thumbnailUrl: (opt.mediaAssets[0] as MediaAsset)?.thumbnailUrl ?? null,
  }))
}

function mapToViewerAnnotations(
  annotations: ClientPortalAnnotation[]
): ViewerAnnotation[] {
  return annotations.map((a) => ({
    id: a.id,
    decisionId: '',
    optionId: a.optionId,
    assetId: a.mediaId,
    type: 'shape',
    data: {
      coordinates: a.coordinates,
      text: a.note,
      color: a.color,
    },
    authorId: null,
    authorName: null,
    createdAt: a.createdAt,
    updatedAt: a.createdAt,
  }))
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
  const viewerOptions = mapToViewerOptions(options)
  const viewerAnnotations = mapToViewerAnnotations(annotations)

  const handleAnnotate = (optionId: string, mediaId: string, data: unknown) => {
    const d = data as {
      type: 'text' | 'shape' | 'freehand'
      data: {
        coordinates: { x: number; y: number; width?: number; height?: number }
        note?: string
        color?: string
      }
    }
    onAnnotate?.(optionId, mediaId, {
      shape: (d?.data?.coordinates?.width ? 'rectangle' : 'point') as 'point' | 'rectangle' | 'area',
      coordinates: d?.data?.coordinates ?? { x: 0, y: 0 },
      note: d?.data?.note,
      color: d?.data?.color,
    })
  }

  return (
    <VisualSideBySideViewerEnhanced
      options={viewerOptions}
      annotations={viewerAnnotations}
      layout="2-up"
      syncZoom
      syncPan
      enableAnnotations={!!onAnnotate}
      enableDeepZoom={true}
      selectedOptionId={selectedOptionId}
      onSelectOption={onSelectOption}
      onAnnotate={onAnnotate ? handleAnnotate : undefined}
      onShare={onShare}
      accentColor={accentColor}
      className={className}
    />
  )
}
