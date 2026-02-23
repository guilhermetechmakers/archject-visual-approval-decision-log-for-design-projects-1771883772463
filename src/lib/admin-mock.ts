/**
 * Admin mock data - used when API is not connected.
 * Replace with real API calls when backend is ready.
 */

import type {
  DashboardSummary,
  Account,
  Workspace,
  AdminUser,
  Dispute,
  BillingException,
  ExportJob,
  RetentionPolicy,
  AdminAuditLog,
  FeatureToggle,
  SystemHealth,
} from '@/types/admin'

export const mockDashboardSummary: DashboardSummary = {
  accounts: {
    total_active_workspaces: 1247,
    trial_signups: 89,
    plan_distribution: [
      { plan: 'free', count: 420 },
      { plan: 'pro', count: 680 },
      { plan: 'enterprise', count: 147 },
    ],
    churn_rate: 2.4,
  },
  system_health: {
    captured_at: new Date().toISOString(),
    uptime_pct: 99.98,
    api_latency_ms: 42,
    errors_last_24h: 12,
    backlog_size: 3,
  },
  usage: {
    traffic_24h: 1250000,
    api_usage: 890000,
    rate_limits_hit: 45,
    pending_requests: 23,
    support_escalations: 7,
  },
  support_queue: {
    disputes_count: 5,
    billing_tickets: 12,
    escalated_count: 3,
  },
}

export const mockSystemHealthHistory: SystemHealth[] = Array.from(
  { length: 24 },
  (_, i) => {
    const h = new Date()
    h.setHours(h.getHours() - (23 - i))
    return {
      captured_at: h.toISOString(),
      uptime_pct: 99.9 + Math.random() * 0.1,
      api_latency_ms: 35 + Math.random() * 30,
      errors_last_24h: Math.floor(Math.random() * 20),
      backlog_size: Math.floor(Math.random() * 10),
    }
  }
)

export const mockHealthHistory = mockSystemHealthHistory

export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Acme Corp',
    status: 'active',
    plan: 'enterprise',
    created_at: '2024-01-15T00:00:00Z',
    last_active: '2025-02-23T10:30:00Z',
    seats: 25,
  },
  {
    id: 'acc-2',
    name: 'TechStart Inc',
    status: 'trial',
    plan: 'pro',
    created_at: '2025-02-01T00:00:00Z',
    last_active: '2025-02-23T09:15:00Z',
    seats: 5,
  },
  {
    id: 'acc-3',
    name: 'Design Studio',
    status: 'active',
    plan: 'pro',
    created_at: '2024-06-20T00:00:00Z',
    last_active: '2025-02-22T18:00:00Z',
    seats: 12,
  },
]

export const mockWorkspaces: Workspace[] = [
  {
    id: 'ws-1',
    account_id: 'acc-1',
    name: 'Acme Main',
    status: 'active',
    plan: 'enterprise',
    created_at: '2024-01-15T00:00:00Z',
    last_activity: '2025-02-23T10:30:00Z',
  },
  {
    id: 'ws-2',
    account_id: 'acc-1',
    name: 'Acme Design',
    status: 'active',
    plan: 'enterprise',
    created_at: '2024-03-01T00:00:00Z',
    last_activity: '2025-02-22T14:00:00Z',
  },
  {
    id: 'ws-3',
    account_id: 'acc-2',
    name: 'TechStart Default',
    status: 'active',
    plan: 'pro',
    created_at: '2025-02-01T00:00:00Z',
    last_activity: '2025-02-23T09:15:00Z',
  },
]

export const mockUsers: AdminUser[] = [
  {
    id: 'usr-1',
    account_id: 'acc-1',
    email: 'admin@acme.com',
    role: 'owner',
    status: 'active',
    last_login: '2025-02-23T10:30:00Z',
  },
  {
    id: 'usr-2',
    account_id: 'acc-1',
    email: 'designer@acme.com',
    role: 'member',
    status: 'active',
    last_login: '2025-02-22T16:00:00Z',
  },
  {
    id: 'usr-3',
    account_id: 'acc-2',
    email: 'founder@techstart.com',
    role: 'owner',
    status: 'active',
    last_login: '2025-02-23T09:15:00Z',
  },
]

export const mockDisputes: Dispute[] = [
  {
    id: 'd-1',
    workspace_id: 'ws-1',
    workspace_name: 'Acme Main',
    status: 'open',
    notes: 'Billing discrepancy',
    created_at: '2025-02-20T10:00:00Z',
    updated_at: '2025-02-23T08:00:00Z',
  },
  {
    id: 'd-2',
    workspace_id: 'ws-3',
    workspace_name: 'TechStart Default',
    status: 'in_review',
    escalated_to: 'support-tier-2',
    created_at: '2025-02-19T14:00:00Z',
    updated_at: '2025-02-22T18:00:00Z',
  },
]

export const mockBillingExceptions: BillingException[] = [
  {
    id: 'be-1',
    account_id: 'acc-1',
    amount: 500,
    currency: 'USD',
    status: 'pending',
    reason: 'Credit adjustment for outage',
    created_at: '2025-02-22T12:00:00Z',
  },
]

export const mockExportJobs: ExportJob[] = [
  {
    id: 'ex-1',
    type: 'audit_log',
    scope: 'account:acc-1',
    status: 'completed',
    created_at: '2025-02-20T10:00:00Z',
    completed_at: '2025-02-20T10:05:00Z',
    location: 's3://exports/audit-acc-1-20250220.zip',
  },
  {
    id: 'ex-2',
    type: 'user_data',
    scope: 'workspace:ws-3',
    status: 'running',
    created_at: '2025-02-23T09:00:00Z',
  },
]

export const mockRetentionPolicies: RetentionPolicy[] = [
  { id: 'rp-1', scope: 'audit_logs', duration_days: 365, enabled: true },
  { id: 'rp-2', scope: 'user_data', duration_days: 730, enabled: true },
]

export const mockAuditLogs: AdminAuditLog[] = [
  {
    id: 'al-1',
    admin_id: 'admin-1',
    action: 'impersonate_start',
    target_type: 'workspace',
    target_id: 'ws-1',
    timestamp: '2025-02-23T10:15:00Z',
    after_state: { workspace_id: 'ws-1' },
  },
  {
    id: 'al-2',
    admin_id: 'admin-1',
    action: 'user_suspend',
    target_type: 'user',
    target_id: 'usr-4',
    timestamp: '2025-02-22T16:00:00Z',
    before_state: { status: 'active' },
    after_state: { status: 'suspended' },
  },
]

export const mockFeatureToggles: FeatureToggle[] = [
  {
    id: 'ft-1',
    feature_name: 'enterprise_sso',
    enabled: true,
    rollout_percentage: 100,
    environment: 'production',
  },
  {
    id: 'ft-2',
    feature_name: 'advanced_analytics',
    enabled: true,
    rollout_percentage: 50,
    environment: 'production',
  },
  {
    id: 'ft-3',
    feature_name: 'beta_export',
    enabled: false,
    rollout_percentage: 0,
    environment: 'production',
  },
]
