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
  status: 'active' | 'suspended' | 'archived'
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
  last_activity: string
}

export interface AdminUser {
  id: string
  account_id: string
  email: string
  role: string
  status: 'active' | 'suspended' | 'pending'
  last_login: string
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
  amount: number
  currency: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface SystemHealth {
  captured_at: string
  uptime_pct: number
  api_latency_ms: number
  errors_last_24h: number
  backlog_size: number
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

export interface RetentionPolicy {
  id: string
  scope: string
  duration_days: number
  enabled: boolean
}

export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  timestamp: string
  before_state?: Record<string, unknown>
  after_state?: Record<string, unknown>
}

export interface DashboardSummary {
  accounts: {
    total_active_workspaces: number
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
}
