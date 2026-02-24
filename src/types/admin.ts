/**
 * Admin Dashboard types - aligned with API contracts and data models.
 */

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT'

export interface Account {
  id: string
  name: string
  status: 'active' | 'suspended' | 'trial'
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
  last_active: string
  seats: number
}

export interface Workspace {
  id: string
  account_id: string
  name: string
  status: 'active' | 'suspended' | 'archived' | 'disabled' | 'pending'
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
  last_activity: string
  domain?: string
  domain_alias?: string
  owner_user_id?: string
  owner_email?: string
  owner_name?: string
  retention_policy?: RetentionPolicy
  associated_user_ids?: string[]
}

export interface RetentionPolicy {
  id: string
  scope: string
  duration_days: number
  enabled: boolean
}

export interface AdminUser {
  id: string
  account_id: string
  email: string
  name?: string
  role: string
  status: 'active' | 'suspended' | 'pending' | 'inactive'
  last_login: string
  tenant_id?: string
  associated_workspace_ids?: string[]
  flags?: { billing_exception?: boolean; dispute_status?: boolean }
}

export interface Dispute {
  id: string
  workspace_id: string
  workspace_name?: string
  status: 'open' | 'in_review' | 'resolved' | 'escalated'
  escalated_to?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface BillingException {
  id: string
  account_id: string
  workspace_id?: string
  amount: number
  currency: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  resolved_at?: string
}

export interface SystemHealth {
  captured_at: string
  uptime_pct: number
  api_latency_ms: number
  errors_last_24h: number
  backlog_size: number
  /** Redis health for token blacklist/revocation store */
  redis_health?: 'healthy' | 'degraded' | 'unavailable'
}

export interface FeatureToggle {
  id: string
  feature_name: string
  enabled: boolean
  rollout_percentage: number
  environment: string
}

export interface ExportJob {
  id: string
  type: string
  scope: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
  location?: string
}

export interface AdminAuditLog {
  id: string
  admin_id: string
  actor_id?: string
  action: string
  action_type?: string
  target_type: 'user' | 'workspace' | 'system'
  target_id: string
  timestamp: string
  payload?: Record<string, unknown>
  before_state?: Record<string, unknown>
  after_state?: Record<string, unknown>
  ip_address?: string
  device_info?: string
}

export interface Escalation {
  id: string
  workspace_id: string
  user_id?: string
  reason: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  created_by: string
  notes?: string
  assigned_team?: string
}

export interface DashboardSummary {
  accounts: {
    total_active_workspaces: number
    total_active_users?: number
    trial_signups: number
    plan_distribution: { plan: string; count: number }[]
    churn_rate: number
  }
  system_health: SystemHealth
  usage: {
    traffic_24h: number
    api_usage: number
    rate_limits_hit: number
    pending_requests: number
    support_escalations: number
  }
  support_queue: {
    disputes_count: number
    billing_tickets: number
    escalated_count: number
  }
  recent_escalations?: Escalation[]
  alerts?: SystemAlert[]
  top_tenants?: { workspace_id: string; workspace_name: string; usage: number }[]
}

export interface SystemAlert {
  id: string
  type: 'maintenance' | 'error' | 'warning' | 'info'
  message: string
  created_at: string
  resolved_at?: string
}
