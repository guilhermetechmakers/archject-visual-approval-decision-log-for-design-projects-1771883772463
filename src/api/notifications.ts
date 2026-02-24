/**
 * Notifications API - In-app mentions, comments, approvals
 * Uses Supabase decision_notifications when configured
 */

import { api } from '@/lib/api'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { DecisionNotification } from '@/types/notifications'

function mapDbToNotification(row: Record<string, unknown>): DecisionNotification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    decisionId: row.decision_id as string,
    type: row.type as DecisionNotification['type'],
    referenceId: (row.reference_id as string) ?? null,
    payload: (row.payload as Record<string, unknown>) ?? {},
    readAt: (row.read_at as string) ?? null,
    createdAt: row.created_at as string,
  }
}

export async function fetchNotifications(
  userId: string,
  options?: { unreadOnly?: boolean; limit?: number }
): Promise<DecisionNotification[]> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('decision_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(options?.limit ?? 50)

    if (options?.unreadOnly) {
      query = query.is('read_at', null)
    }

    const { data, error } = await query

    if (error) throw error
    return (data ?? []).map((r: Record<string, unknown>) => mapDbToNotification(r))
  }

  return api.get<DecisionNotification[]>(
    `/notifications?user_id=${encodeURIComponent(userId)}${options?.unreadOnly ? '&unread_only=1' : ''}`
  )
}

export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('decision_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)

    if (error) throw error
    return
  }

  return api.patch(`/notifications/${notificationId}/read`)
}

export async function markAllNotificationsRead(
  userId: string
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('decision_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)

    if (error) throw error
    return
  }

  return api.post(`/notifications/mark-all-read`, { userId })
}
