/**
 * Notification types for decision mentions, comments, approvals
 */

export type NotificationType =
  | 'mention'
  | 'comment'
  | 'approval'
  | 'changes_requested'
  | 'reminder'

export interface DecisionNotification {
  id: string
  userId: string
  decisionId: string
  type: NotificationType
  referenceId?: string | null
  payload: Record<string, unknown>
  readAt?: string | null
  createdAt: string
}

export interface NotificationPreferences {
  realtime: boolean
  digest: boolean
  email: boolean
  muted: boolean
}
