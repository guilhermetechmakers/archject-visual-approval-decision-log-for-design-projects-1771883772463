/**
 * Annotations API - CRUD for decision annotations
 */

import { api } from '@/lib/api'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export type AnnotationType = 'text' | 'shape' | 'freehand'

export interface AnnotationData {
  coordinates?: { x: number; y: number; width?: number; height?: number }
  points?: [number, number][]
  text?: string
  color?: string
  stroke?: number
}

export interface Annotation {
  id: string
  decisionId: string
  optionId: string | null
  assetId: string | null
  type: AnnotationType
  data: AnnotationData
  authorId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAnnotationPayload {
  optionId?: string | null
  assetId?: string | null
  /** DB type: text | shape | freehand. Shape covers point, rectangle, area. */
  type: AnnotationType
  data: AnnotationData
  /** Viewer shape (point, rectangle, area, freehand) - used to derive type */
  shape?: string
}

function shapeToDbType(shape: string): AnnotationType {
  if (shape === 'freehand') return 'freehand'
  if (shape === 'text') return 'text'
  return 'shape'
}

export async function fetchAnnotations(
  decisionId: string
): Promise<Annotation[]> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('decision_annotations')
      .select('*')
      .eq('decision_id', decisionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      decisionId: row.decision_id as string,
      optionId: row.option_id as string | null,
      assetId: row.asset_id as string | null,
      type: row.type as AnnotationType,
      data: (row.data as AnnotationData) ?? {},
      authorId: row.author_id as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }))
  }

  return api.get<Annotation[]>(`/decisions/${decisionId}/annotations`)
}

export async function createAnnotation(
  decisionId: string,
  payload: CreateAnnotationPayload & { shape?: string }
): Promise<Annotation> {
  const dbType = payload.shape ? shapeToDbType(payload.shape) : payload.type
  const dataPayload = payload.data ?? {}

  if (isSupabaseConfigured && supabase) {
    const { data: session } = await supabase.auth.getSession()
    const userId = session.session?.user?.id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('decision_annotations')
      .insert({
        decision_id: decisionId,
        option_id: payload.optionId ?? null,
        asset_id: payload.assetId ?? null,
        type: dbType,
        data: dataPayload,
        author_id: userId,
      })
      .select()
      .single()

    if (error) throw error
    const row = data as Record<string, unknown>
    return {
      id: row.id as string,
      decisionId: row.decision_id as string,
      optionId: row.option_id as string | null,
      assetId: row.asset_id as string | null,
      type: row.type as AnnotationType,
      data: (row.data as AnnotationData) ?? {},
      authorId: row.author_id as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }
  }

  return api.post<Annotation>(`/decisions/${decisionId}/annotations`, payload)
}

export async function updateAnnotation(
  decisionId: string,
  annotationId: string,
  payload: Partial<{ data: AnnotationData; type: AnnotationType }>
): Promise<Annotation> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('decision_annotations')
      .update({
        ...payload,
        data: payload.data ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', annotationId)
      .eq('decision_id', decisionId)
      .select()
      .single()

    if (error) throw error
    const row = data as Record<string, unknown>
    return {
      id: row.id as string,
      decisionId: row.decision_id as string,
      optionId: row.option_id as string | null,
      assetId: row.asset_id as string | null,
      type: row.type as AnnotationType,
      data: (row.data as AnnotationData) ?? {},
      authorId: row.author_id as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }
  }

  return api.patch<Annotation>(
    `/decisions/${decisionId}/annotations/${annotationId}`,
    payload
  )
}

export async function deleteAnnotation(
  decisionId: string,
  annotationId: string
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('decision_annotations')
      .delete()
      .eq('id', annotationId)
      .eq('decision_id', decisionId)

    if (error) throw error
    return
  }

  return api.delete(`/decisions/${decisionId}/annotations/${annotationId}`)
}
