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
  Escalation,
  SystemAlert,
} from '@/types/admin'

export const mockAlerts: SystemAlert[] = [
  {
    id: 'alert-1',
    type: 'info',
    message: 'Scheduled maintenance: Feb 25, 02:00–04:00 UTC',
    created_at: '2025-02-22T10:00:00Z',
  },
]

export const mockEscalations: Escalation[] = [
  {
    id: 'esc-1',
    workspace_id: 'ws-1',
    user_id: 'usr-1',
    reason: 'Billing discrepancy - customer dispute',
    priority: 'high',
    status: 'in_progress',
    created_at: '2025-02-23T08:00:00Z',
    created_by: 'admin-1',
    notes: 'Awaiting finance team response',
    assigned_team: 'support-tier-2',
  },
  {
    id: 'esc-2',
    workspace_id: 'ws-3',
    user_id: 'usr-3',
    reason: 'Data export request - GDPR',
    priority: 'critical',
    status: 'open',
    created_at: '2025-02-23T09:30:00Z',
    created_by: 'admin-1',
    assigned_team: 'compliance',
  },
]

export const mockDashboardSummary: DashboardSummary = {
  accounts: {
    total_active_workspaces: 1247,
    total_active_users: 3420,
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
    redis_health: 'healthy',
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
  recent_escalations: mockEscalations.slice(0, 5),
  alerts: mockAlerts,
  top_tenants: [
    { workspace_id: 'ws-1', workspace_name: 'Acme Main', usage: 45000 },
    { workspace_id: 'ws-2', workspace_name: 'Acme Design', usage: 32000 },
    { workspace_id: 'ws-3', workspace_name: 'TechStart Default', usage: 18000 },
  ],
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
      redis_health: 'healthy' as const,
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
    domain: 'acme.com',
    domain_alias: 'acme-main.archject.app',
    owner_user_id: 'usr-1',
    owner_email: 'admin@acme.com',
    owner_name: 'Jane Admin',
    status: 'active',
    plan: 'enterprise',
    created_at: '2024-01-15T00:00:00Z',
    last_activity: '2025-02-23T10:30:00Z',
    associated_user_ids: ['usr-1', 'usr-2'],
  },
  {
    id: 'ws-2',
    account_id: 'acc-1',
    name: 'Acme Design',
    domain: 'design.acme.com',
    owner_user_id: 'usr-2',
    owner_email: 'designer@acme.com',
    owner_name: 'John Designer',
    status: 'active',
    plan: 'enterprise',
    created_at: '2024-03-01T00:00:00Z',
    last_activity: '2025-02-22T14:00:00Z',
    associated_user_ids: ['usr-1', 'usr-2'],
  },
  {
    id: 'ws-3',
    account_id: 'acc-2',
    name: 'TechStart Default',
    domain: 'techstart.io',
    owner_user_id: 'usr-3',
    owner_email: 'founder@techstart.com',
    owner_name: 'Alex Founder',
    status: 'active',
    plan: 'pro',
    created_at: '2025-02-01T00:00:00Z',
    last_activity: '2025-02-23T09:15:00Z',
    associated_user_ids: ['usr-3'],
  },
  {
    id: 'ws-4',
    account_id: 'acc-3',
    name: 'Design Studio',
    domain: 'designstudio.co',
    owner_user_id: 'usr-4',
    owner_email: 'owner@designstudio.co',
    owner_name: 'Sam Owner',
    status: 'pending',
    plan: 'free',
    created_at: '2025-02-20T00:00:00Z',
    last_activity: '2025-02-20T12:00:00Z',
    associated_user_ids: ['usr-4'],
  },
]

export const mockUsers: AdminUser[] = [
  {
    id: 'usr-1',
    account_id: 'acc-1',
    email: 'admin@acme.com',
    name: 'Jane Admin',
    role: 'owner',
    status: 'active',
    last_login: '2025-02-23T10:30:00Z',
    tenant_id: 'acc-1',
    associated_workspace_ids: ['ws-1', 'ws-2'],
    flags: { billing_exception: false, dispute_status: false },
  },
  {
    id: 'usr-2',
    account_id: 'acc-1',
    email: 'designer@acme.com',
    name: 'John Designer',
    role: 'member',
    status: 'active',
    last_login: '2025-02-22T16:00:00Z',
    tenant_id: 'acc-1',
    associated_workspace_ids: ['ws-1', 'ws-2'],
    flags: {},
  },
  {
    id: 'usr-3',
    account_id: 'acc-2',
    email: 'founder@techstart.com',
    name: 'Alex Founder',
    role: 'owner',
    status: 'active',
    last_login: '2025-02-23T09:15:00Z',
    tenant_id: 'acc-2',
    associated_workspace_ids: ['ws-3'],
    flags: {},
  },
  {
    id: 'usr-4',
    account_id: 'acc-3',
    email: 'owner@designstudio.co',
    name: 'Sam Owner',
    role: 'owner',
    status: 'pending',
    last_login: '2025-02-20T12:00:00Z',
    tenant_id: 'acc-3',
    associated_workspace_ids: ['ws-4'],
    flags: { billing_exception: true },
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
    workspace_id: 'ws-1',
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
    actor_id: 'admin-1',
    action: 'impersonate_start',
    action_type: 'impersonate_start',
    target_type: 'workspace',
    target_id: 'ws-1',
    timestamp: '2025-02-23T10:15:00Z',
    payload: { workspace_id: 'ws-1', reason: 'Support ticket #12345' },
    after_state: { workspace_id: 'ws-1' },
  },
  {
    id: 'al-token-1',
    admin_id: 'admin-1',
    actor_id: 'admin-1',
    action: 'token_revoke',
    action_type: 'token_revoke',
    target_type: 'user',
    target_id: 'usr-4',
    timestamp: '2025-02-23T09:45:00Z',
    payload: { reason: 'Security incident' },
  },
  {
    id: 'al-token-2',
    admin_id: 'admin-1',
    actor_id: 'admin-1',
    action: 'force_logout',
    action_type: 'force_logout',
    target_type: 'user',
    target_id: 'usr-3',
    timestamp: '2025-02-23T09:30:00Z',
    payload: { sessions_revoked: 2 },
  },
  {
    id: 'al-2',
    admin_id: 'admin-1',
    actor_id: 'admin-1',
    action: 'user_suspend',
    action_type: 'user_suspend',
    target_type: 'user',
    target_id: 'usr-4',
    timestamp: '2025-02-22T16:00:00Z',
    before_state: { status: 'active' },
    after_state: { status: 'suspended' },
  },
  {
    id: 'al-3',
    admin_id: 'admin-1',
    actor_id: 'admin-1',
    action: 'workspace_disable',
    action_type: 'workspace_disable',
    target_type: 'workspace',
    target_id: 'ws-5',
    timestamp: '2025-02-22T14:00:00Z',
    payload: { reason: 'Terms violation' },
  },
  {
    id: 'al-4',
    admin_id: 'admin-1',
    actor_id: 'admin-1',
    action: 'escalation_create',
    action_type: 'escalation_create',
    target_type: 'workspace',
    target_id: 'ws-1',
    timestamp: '2025-02-23T08:00:00Z',
    payload: { escalation_id: 'esc-1', priority: 'high' },
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
