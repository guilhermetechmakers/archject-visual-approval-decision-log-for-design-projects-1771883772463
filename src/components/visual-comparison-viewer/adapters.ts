/**
 * Adapters to convert DecisionOption, ClientPortalOption, DecisionOptionForm to ComparisonOption
 */

import type { DecisionOption } from '@/types/decision-detail'
import type { DecisionOptionForm } from '@/types/decision-editor'
import type {
  ClientPortalOption,
  ClientPortalAnnotation,
  MediaAsset,
} from '@/types/client-portal'
import type {
  ComparisonOption,
  ComparisonAnnotation,
  ComparisonMediaAsset,
} from '@/types/visual-comparison'

function getFirstMediaUrl(opt: DecisionOption): string | null {
  const firstId = opt.mediaPreviewIds[0]
  if (!firstId) return null
  const att = opt.attachments.find((a) => a.id === firstId)
  return att?.url ?? null
}

function getFirstMediaId(opt: DecisionOption): string | null {
  return opt.mediaPreviewIds[0] ?? opt.attachments[0]?.id ?? null
}

export function toComparisonOptions(options: DecisionOption[]): ComparisonOption[] {
  return options.map((opt) => ({
    id: opt.id,
    title: opt.title,
    description: opt.description,
    mediaUrl: getFirstMediaUrl(opt),
    mediaId: getFirstMediaId(opt),
    thumbnailUrl: opt.attachments[0]?.thumbnailUrl ?? getFirstMediaUrl(opt),
    assets: opt.attachments.map((a) => ({
      id: a.id,
      type: a.type as ComparisonMediaAsset['type'],
      url: a.url,
      thumbnailUrl: a.thumbnailUrl,
      metadata: {},
    })),
  }))
}

function getFirstMediaFromClient(opt: ClientPortalOption): string | null {
  const first = opt.mediaAssets[0] ?? opt.mediaUrls?.[0]
  return typeof first === 'string' ? first : (first as MediaAsset)?.url ?? null
}

function getFirstMediaIdFromClient(opt: ClientPortalOption): string | null {
  return opt.mediaAssets[0]?.id ?? opt.id
}

export function toComparisonOptionsFromEditor(
  options: DecisionOptionForm[]
): ComparisonOption[] {
  return options.map((opt) => {
    const primary = opt.mediaFiles.find((m) => m.isPrimary) ?? opt.mediaFiles[0]
    const url = primary?.url ?? null
    const mediaId = primary?.id ?? opt.id
    return {
      id: opt.id,
      title: opt.title,
      description: opt.description,
      mediaUrl: url,
      mediaId,
      thumbnailUrl: primary?.thumbnailUrl ?? url,
      assets: opt.mediaFiles.map((m) => ({
        id: m.id,
        type: m.type as ComparisonMediaAsset['type'],
        url: m.url,
        thumbnailUrl: m.thumbnailUrl,
        metadata: {},
      })),
    }
  })
}

export function toComparisonOptionsFromClientPortal(
  options: ClientPortalOption[]
): ComparisonOption[] {
  return options.map((opt) => ({
    id: opt.id,
    title: opt.title,
    description: opt.description,
    mediaUrl: getFirstMediaFromClient(opt),
    mediaId: getFirstMediaIdFromClient(opt),
    thumbnailUrl: (opt.mediaAssets[0] as MediaAsset)?.thumbnailUrl ?? getFirstMediaFromClient(opt),
    assets: (opt.mediaAssets ?? []).map((a) => ({
      id: a.id,
      type: a.type as ComparisonMediaAsset['type'],
      url: a.url,
      thumbnailUrl: a.thumbnailUrl,
      metadata: a.metadata,
    })),
  }))
}

export function toComparisonAnnotations(
  annotations: Array<{
    id: string
    mediaId: string
    optionId?: string
    type?: string
    data?: {
      coordinates?: { x: number; y: number; width?: number; height?: number }
      points?: [number, number][]
    }
    createdAt: string
    createdBy?: string
  }>,
  options: DecisionOption[],
  fallbackOptionId?: string
): ComparisonAnnotation[] {
  const mediaToOption = new Map<string, string>()
  for (const opt of options) {
    for (const att of opt.attachments) {
      mediaToOption.set(att.id, opt.id)
    }
  }
  return annotations.map((a) => ({
    id: a.id,
    optionId: a.optionId ?? mediaToOption.get(a.mediaId) ?? fallbackOptionId ?? '',
    mediaId: a.mediaId,
    shape: (a.type as ComparisonAnnotation['shape']) ?? 'point',
    coordinates: a.data?.coordinates ?? { x: 0, y: 0 },
    points: a.data?.points,
    createdAt: a.createdAt,
  }))
}

export function toComparisonAnnotationsFromClientPortal(
  annotations: ClientPortalAnnotation[],
  optionId?: string
): ComparisonAnnotation[] {
  return annotations.map((a) => ({
    id: a.id,
    optionId: optionId ?? a.optionId,
    mediaId: a.mediaId,
    shape: a.shape as ComparisonAnnotation['shape'],
    coordinates: a.coordinates,
    note: a.note,
    color: a.color,
    createdAt: a.createdAt,
  }))
}
