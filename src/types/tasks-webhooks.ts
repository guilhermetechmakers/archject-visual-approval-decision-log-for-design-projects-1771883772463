/**
 * Light Tasking & Webhook types - aligns with backend schema
 */

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'

export type TaskPriority = 'low' | 'med' | 'high'

export interface Task {
  id: string
  decision_id: string
  assignee_id: string | null
  due_date: string | null
  status: TaskStatus
  priority: TaskPriority
  notes: string | null
  created_at: string
  updated_at: string
  /** Resolved from assignee_id */
  assignee_name?: string | null
  /** Resolved from decision_id */
  decision_title?: string | null
}

export interface CreateTaskPayload {
  decision_id: string
  assignee_id?: string | null
  due_date?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  notes?: string | null
}

export interface UpdateTaskPayload {
  assignee_id?: string | null
  due_date?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  notes?: string | null
}

export type WebhookEvent =
  | 'decision.created'
  | 'decision.approved'
  | 'decision.rejected'
  | 'decision.revoked'
  | 'options.updated'
  | 'comment.added'
  | 'reminder.sent'

export interface WebhookRetrySettings {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
}

export interface WebhookEndpoint {
  id: string
  workspace_id: string
  url: string
  /** Per-endpoint signing secret (HMAC-SHA256); never exposed in responses */
  signing_secret?: string
  events: WebhookEvent[]
  enabled: boolean
  retry_settings?: WebhookRetrySettings | null
  last_triggered_at?: string | null
  last_test_at?: string | null
  last_test_status?: 'success' | 'failed' | null
  created_at: string
  updated_at: string
}

export interface CreateWebhookPayload {
  url: string
  events: WebhookEvent[]
  signing_secret?: string
  enabled?: boolean
  retry_settings?: WebhookRetrySettings
}

export interface UpdateWebhookPayload {
  url?: string
  events?: WebhookEvent[]
  signing_secret?: string
  enabled?: boolean
  retry_settings?: WebhookRetrySettings
}

export interface WebhookTestResult {
  success: boolean
  status_code?: number
  message?: string
}
