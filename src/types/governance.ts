/**
 * Security, Privacy & Compliance - Data Governance types.
 * Aligned with API contracts and data models.
 */

export interface AuditLog {
  id: string
  workspace_id: string
  project_id: string | null
  user_id: string
  action: string
  resource: string
  target_id: string | null
  timestamp: string
  ip_address?: string | null
  device?: string | null
  immutable_hash?: string | null
  context?: Record<string, unknown> | null
}

export interface AuditLogFilters {
  workspace_id?: string
  project_id?: string
  user_id?: string
  action?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface DataExportJob {
  id: string
  workspace_id: string
  scope: {
    decisions?: boolean
    logs?: boolean
    files?: boolean
  }
  format: 'zip' | 'tar'
  status: 'queued' | 'running' | 'completed' | 'failed'
  created_at: string
  completed_at?: string | null
  s3_key?: string | null
  download_url?: string | null
  policy_id?: string | null
  user_id: string
  metadata?: Record<string, unknown> | null
}

export interface CreateExportJobRequest {
  workspace_id: string
  scope: {
    decisions?: boolean
    logs?: boolean
    files?: boolean
  }
  format: 'zip' | 'tar'
}

export interface RetentionPolicy {
  id: string
  workspace_id: string
  policy_name: string
  mode: 'archive' | 'delete'
  duration_days: number
  schedule_cron?: string | null
  criteria?: Record<string, unknown> | null
  legal_hold: boolean
  created_at: string
  updated_at: string
}

export interface CreateRetentionPolicyRequest {
  workspace_id: string
  policy_name: string
  mode: 'archive' | 'delete'
  duration_days: number
  schedule_cron?: string
  criteria?: Record<string, unknown>
  legal_hold?: boolean
}

export interface PrivacyControl {
  id: string
  workspace_id: string
  masking_rules?: Record<string, unknown>[] | null
  data_categories?: string[] | null
  data_owner_id?: string | null
  access_controls?: Record<string, unknown> | null
  last_applied_at?: string | null
}

export interface UpdatePrivacyControlRequest {
  masking_rules?: Record<string, unknown>[]
  data_categories?: string[]
  data_owner_id?: string | null
  access_controls?: Record<string, unknown>
}

export interface SystemHealth {
  captured_at: string
  uptime_pct: number
  api_latency_ms: number
  errors_last_24h: number
  backlog_size: number
  redis_health?: 'healthy' | 'degraded' | 'unavailable'
}

export interface ComplianceStatus {
  audit_trail_verified: boolean
  retention_policy_active: boolean
  encryption_at_rest: boolean
  encryption_in_transit: boolean
  soc2_roadmap_status?: string
  iso_roadmap_status?: string
}
