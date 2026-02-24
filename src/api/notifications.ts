/**
 * Notifications API - In-app mentions, comments, approvals
 * Uses Supabase decision_notifications when configured
 */

import { api } from '@/lib/api'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  DecisionNotification,
  NotificationEnginePreferences,
} from '@/types/notifications'

function mapDbToNotification(row: Record<string, unknown>): DecisionNotification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    decisionId: row.decision_id as string,
    projectId: (row.project_id as string) ?? null,
    type: row.type as DecisionNotification['type'],
    channel: (row.channel as DecisionNotification['channel']) ?? 'in_app',
    status: (row.status as DecisionNotification['status']) ?? 'delivered',
    referenceId: (row.reference_id as string) ?? null,
    payload: (row.payload as Record<string, unknown>) ?? {},
    readAt: (row.read_at as string) ?? null,
    snoozedUntil: (row.snoozed_until as string) ?? null,
    mutedUntil: (row.muted_until as string) ?? null,
    deliveredAt: (row.delivered_at as string) ?? null,
    error: (row.error as string) ?? null,
    createdAt: row.created_at as string,
  }
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  if (err && typeof err === 'object' && 'context' in err) {
    const ctx = (err as { context?: { body?: { message?: string } } }).context
    if (ctx?.body?.message) return ctx.body.message
  }
  return 'An error occurred'
}

async function invokeEdgeFunction<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured')
  }
  const { data, error } = await supabase.functions.invoke(name, { body: body ?? {} })
  if (error) throw new Error(getErrorMessage(error))
  return data as T
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

/** Snooze a notification until a given time */
export async function snoozeNotification(
  notificationId: string,
  until: string
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('decision_notifications')
      .update({ snoozed_until: until })
      .eq('id', notificationId)

    if (error) throw error
    return
  }

  return api.post(`/notifications/${notificationId}/snooze`, { until })
}

/** Mute a notification until a given time */
export async function muteNotification(
  notificationId: string,
  until: string
): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('decision_notifications')
      .update({ muted_until: until })
      .eq('id', notificationId)

    if (error) throw error
    return
  }

  return api.post(`/notifications/${notificationId}/mute`, { until })
}

/** Fetch notification engine preferences */
export async function fetchNotificationPreferences(
  userId: string,
  workspaceId?: string | null
): Promise<NotificationEnginePreferences | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const data = await invokeEdgeFunction<Record<string, unknown> | null>(
        'notifications-preferences',
        { action: 'get', workspaceId: workspaceId ?? undefined }
      )
      if (!data || typeof data !== 'object') return null
      const row = data as Record<string, unknown>
      const start = (row.quietHoursStart ?? row.quiet_hours_start) as string | null
      const end = (row.quietHoursEnd ?? row.quiet_hours_end) as string | null
      return {
        id: (row.id ?? row.user_id) as string,
        userId: (row.userId ?? row.user_id) as string,
        workspaceId: (row.workspaceId ?? row.workspace_id) as string | null ?? null,
        channels: (row.channels as NotificationEnginePreferences['channels']) ?? { inApp: true, email: true, sms: false },
        frequency: (row.frequency as NotificationEnginePreferences['frequency']) ?? 'immediate',
        quietHours: start && end ? { start, end } : undefined,
        quietHoursStart: start ?? undefined,
        quietHoursEnd: end ?? undefined,
        mutedUntil: (row.mutedUntil ?? row.muted_until) as string | null ?? null,
        globalMute: (row.globalMute ?? row.global_mute) as boolean ?? false,
        createdAt: (row.createdAt ?? row.created_at) as string,
        updatedAt: (row.updatedAt ?? row.updated_at) as string,
      }
    } catch {
      return null
    }
  }

  return api.get<NotificationEnginePreferences | null>(
    `/notifications/preferences?user_id=${encodeURIComponent(userId)}${workspaceId ? `&workspace_id=${encodeURIComponent(workspaceId)}` : ''}`
  )
}

/** Update notification engine preferences */
export async function updateNotificationPreferences(
  userId: string,
  prefs: Partial<Omit<NotificationEnginePreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  workspaceId?: string | null
): Promise<NotificationEnginePreferences> {
  if (isSupabaseConfigured && supabase) {
    const data = await invokeEdgeFunction<Record<string, unknown>>('notifications-preferences', {
      action: 'update',
      workspaceId: workspaceId ?? undefined,
      channels: prefs.channels,
      frequency: prefs.frequency,
      quietHoursStart: prefs.quietHours?.start ?? prefs.quietHoursStart,
      quietHoursEnd: prefs.quietHours?.end ?? prefs.quietHoursEnd,
      globalMute: prefs.globalMute,
    })
    const row = (data ?? {}) as Record<string, unknown>
    const start = row.quiet_hours_start as string | null
    const end = row.quiet_hours_end as string | null
    return {
      id: row.id as string,
      userId: row.user_id as string,
      workspaceId: (row.workspace_id as string) ?? null,
      channels: (row.channels as NotificationEnginePreferences['channels']) ?? { inApp: true, email: true, sms: false },
      frequency: (row.frequency as NotificationEnginePreferences['frequency']) ?? 'immediate',
      quietHours: start && end ? { start, end } : undefined,
      quietHoursStart: start ?? undefined,
      quietHoursEnd: end ?? undefined,
      mutedUntil: (row.muted_until as string) ?? null,
      globalMute: (row.global_mute as boolean) ?? false,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }
  }

  return api.put<NotificationEnginePreferences>('/notifications/preferences', {
    userId,
    workspaceId,
    ...prefs,
  })
}

/** Test SendGrid integration */
export async function testSendGrid(apiKey?: string): Promise<{ success: boolean; message?: string }> {
  return invokeEdgeFunction<{ success: boolean; message?: string }>('integrations-sendgrid-test', { apiKey })
}

/** Test Twilio integration */
export async function testTwilio(params?: {
  accountSid?: string
  authToken?: string
  fromNumber?: string
}): Promise<{ success: boolean; message?: string }> {
  return invokeEdgeFunction<{ success: boolean; message?: string }>('integrations-twilio-test', params ?? {})
}

/** Request notification history export */
export async function requestNotificationExport(params: {
  format: 'json' | 'csv'
  dateFrom?: string
  dateTo?: string
}): Promise<{ id: string; status: string; initiatedAt: string }> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user } } = await (supabase as any).auth.getUser()
    if (!user?.id) throw new Error('Not authenticated')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('notification_exports')
      .insert({
        user_id: user.id,
        format: params.format,
        status: 'pending',
        date_from: params.dateFrom ?? null,
        date_to: params.dateTo ?? null,
      })
      .select('id, status, initiated_at')
      .single()

    if (error) throw error
    const row = (data ?? {}) as Record<string, unknown>
    return {
      id: row.id as string,
      status: row.status as string,
      initiatedAt: row.initiated_at as string,
    }
  }

  return api.post<{ id: string; status: string; initiatedAt: string }>('/notifications/export', params)
}
