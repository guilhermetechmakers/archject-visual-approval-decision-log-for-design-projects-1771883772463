/**
 * Segment / Analytics event tracking - data contracts for decision lifecycle events
 * Events feed dashboards and usage metrics
 */

export type SegmentEventName =
  | 'decision_created'
  | 'decision_proposed'
  | 'decision_updated'
  | 'decision_client_view'
  | 'decision_client_reply'
  | 'decision_approved'
  | 'decision_rejected'
  | 'decision_closed'
  | 'template_viewed'
  | 'template_used'
  | 'template_prefilled'
  | 'project_viewed'
  | 'project_updated'
  | 'link_shared'
  | 'link_viewed'
  | 'link_downloaded'
  | 'user_logged_in'
  | 'workspace_switched'
  | 'export_requested'
  | 'export_completed'
  | 'report_scheduled'
  | 'analytics_viewed'
  | 'dashboard_viewed'

export interface SegmentEventProperties {
  workspace_id?: string
  project_id?: string
  decision_id?: string
  template_id?: string
  user_id?: string
  client_id?: string
  timestamp?: string // ISO UTC
  decision_status?: string
  response_time_ms?: number
  template_completion_rate?: number
  decision_duration_ms?: number
  device?: string
  browser?: string
  location?: string
  channel?: 'web' | 'mobile'
  export_format?: string
  report_id?: string
  [key: string]: unknown
}

export interface SegmentTrackPayload {
  event: SegmentEventName
  userId?: string
  anonymousId?: string
  properties?: SegmentEventProperties
  timestamp?: string // ISO UTC
  context?: {
    library?: { name: string; version: string }
    [key: string]: unknown
  }
}
