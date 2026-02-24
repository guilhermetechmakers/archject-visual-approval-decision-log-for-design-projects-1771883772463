/**
 * Notification types for decision mentions, comments, approvals
 */

export type NotificationType =
  | 'mention'
  | 'comment'
  | 'approval'
  | 'changes_requested'
  | 'reminder'

export type NotificationChannel = 'in_app' | 'email' | 'sms'

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'failed'

export interface DecisionNotification {
  id: string
  userId: string
  decisionId: string
  projectId?: string | null
  type: NotificationType
  channel?: NotificationChannel
  status?: NotificationStatus
  referenceId?: string | null
  payload: Record<string, unknown>
  readAt?: string | null
  snoozedUntil?: string | null
  mutedUntil?: string | null
  deliveredAt?: string | null
  error?: string | null
  createdAt: string
}

export interface NotificationPreferences {
  realtime: boolean
  digest: boolean
  email: boolean
  muted: boolean
}

/** Notification engine preferences (channels, frequency, quiet hours) */
export interface NotificationEnginePreferences {
  id?: string
  userId: string
  workspaceId?: string | null
  channels: { inApp: boolean; email: boolean; sms: boolean }
  frequency: 'immediate' | 'digest'
  /** Quiet hours as HH:mm (e.g. "22:00", "08:00") */
  quietHours?: { start: string; end: string }
  quietHoursStart?: string
  quietHoursEnd?: string
  mutedUntil?: string | null
  globalMute?: boolean
  createdAt?: string
  updatedAt?: string
}

/** Query params for notifications list */
export interface NotificationsQueryParams {
  userId: string
  status?: 'read' | 'unread' | 'all'
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}
