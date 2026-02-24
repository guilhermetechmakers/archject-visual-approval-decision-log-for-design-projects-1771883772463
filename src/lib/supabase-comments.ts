/**
 * Supabase Comments CRUD - Threaded comments with mentions and moderation
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { DecisionComment } from '@/types/decision-detail'

const EDIT_WINDOW_MINUTES = 15

function mapDbCommentToDecisionComment(row: Record<string, unknown>): DecisionComment {
  const mentions = Array.isArray(row.mentions) ? (row.mentions as string[]) : []
  const status = row.status as string
  return {
    id: row.id as string,
    decisionId: row.decision_id as string,
    parentCommentId: (row.parent_id as string) ?? null,
    authorId: (row.user_id as string) ?? 'anonymous',
    authorName: (row.author_name as string) ?? undefined,
    authorAvatarUrl: (row.author_avatar_url as string) ?? null,
    content: row.text as string,
    createdAt: row.created_at as string,
    editedAt: (row.edited_at as string) ?? undefined,
    editedBy: (row.edited_by as string) ?? undefined,
    status: status === 'active' || status === 'edited' || status === 'deleted' ? status : undefined,
    mentions,
    optionId: (row.option_id as string) ?? undefined,
  }
}

export async function supabaseFetchComments(
  decisionId: string
): Promise<DecisionComment[]> {
  if (!isSupabaseConfigured || !supabase) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('decision_comments')
    .select('*')
    .eq('decision_id', decisionId)
    .order('created_at', { ascending: true })

  if (error) throw error

  const rows = (data ?? []) as Record<string, unknown>[]
  const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))] as string[]
  let names: Record<string, string> = {}
  if (userIds.length > 0) {
    try {
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)
      for (const p of profiles ?? []) {
        const row = p as { id: string; full_name?: string }
        names[row.id] = row.full_name ?? ''
      }
    } catch {
      // profiles may not exist
    }
  }
  return rows
    .filter((r) => (r.status as string) !== 'deleted')
    .map((r) =>
      mapDbCommentToDecisionComment({
        ...r,
        author_name: names[(r.user_id as string) ?? ''] || undefined,
      })
    )
}

export async function supabaseCreateComment(
  decisionId: string,
  payload: {
    content: string
    parentCommentId?: string | null
    optionId?: string | null
    mentions?: string[]
  }
): Promise<DecisionComment> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user?.id

  const insertPayload = {
    decision_id: decisionId,
    user_id: userId ?? null,
    parent_id: payload.parentCommentId ?? null,
    option_id: payload.optionId ?? null,
    text: payload.content.trim(),
    mentions: payload.mentions ?? [],
    status: 'active',
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('decision_comments')
    .insert(insertPayload)
    .select('*')
    .single()

  if (error) throw error
  return mapDbCommentToDecisionComment((data ?? {}) as Record<string, unknown>)
}

export async function supabaseUpdateComment(
  decisionId: string,
  commentId: string,
  payload: { content: string; mentions?: string[] }
): Promise<DecisionComment> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user?.id

  const updatePayload: Record<string, unknown> = {
    text: payload.content.trim(),
    status: 'edited',
    edited_at: new Date().toISOString(),
    edited_by: userId,
  }
  if (payload.mentions != null) {
    updatePayload.mentions = payload.mentions
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('decision_comments')
    .update(updatePayload)
    .eq('id', commentId)
    .eq('decision_id', decisionId)
    .select('*')
    .single()

  if (error) throw error
  return mapDbCommentToDecisionComment((data ?? {}) as Record<string, unknown>)
}

export async function supabaseDeleteComment(
  decisionId: string,
  commentId: string,
  softDelete = true
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured')
  }

  if (softDelete) {
    const { data: session } = await supabase.auth.getSession()
    const userId = session.session?.user?.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('decision_comments')
      .update({
        text: '[deleted]',
        status: 'deleted',
        edited_at: new Date().toISOString(),
        edited_by: userId,
      })
      .eq('id', commentId)
      .eq('decision_id', decisionId)
    if (error) throw error
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('decision_comments')
      .delete()
      .eq('id', commentId)
      .eq('decision_id', decisionId)
    if (error) throw error
  }
}

export function canEditComment(createdAt: string): boolean {
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  return now - created <= EDIT_WINDOW_MINUTES * 60 * 1000
}

export function parseMentions(text: string): string[] {
  return [...new Set((text.match(/@(\w+)/g) ?? []).map((m) => m.slice(1)))]
}
