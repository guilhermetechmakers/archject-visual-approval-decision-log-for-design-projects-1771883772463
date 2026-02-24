/**
 * Governance mock data - used when API is not connected.
 */

import type {
  AuditLog,
  DataExportJob,
  RetentionPolicy,
  PrivacyControl,
  SystemHealth,
  ComplianceStatus,
} from '@/types/governance'

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'al-1',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    user_id: 'usr-1',
    action: 'decision_approved',
    resource: 'decision',
    target_id: 'dec-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ip_address: '192.168.1.1',
    device: 'Chrome/120',
    immutable_hash: 'sha256:abc123',
    context: { option_id: 'opt-1' },
  },
  {
    id: 'al-2',
    workspace_id: 'ws-1',
    project_id: null,
    user_id: 'usr-1',
    action: 'export_created',
    resource: 'export',
    target_id: 'ex-1',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    ip_address: '192.168.1.1',
    immutable_hash: 'sha256:def456',
  },
  {
    id: 'al-3',
    workspace_id: 'ws-2',
    project_id: 'proj-2',
    user_id: 'usr-2',
    action: 'retention_policy_updated',
    resource: 'retention_policy',
    target_id: 'rp-1',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    immutable_hash: 'sha256:ghi789',
  },
  {
    id: 'al-4',
    workspace_id: 'ws-1',
    project_id: 'proj-1',
    user_id: 'usr-1',
    action: 'user_invited',
    resource: 'user',
    target_id: 'usr-3',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'al-5',
    workspace_id: 'ws-3',
    project_id: null,
    user_id: 'usr-3',
    action: 'privacy_control_updated',
    resource: 'privacy_control',
    target_id: 'pc-1',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
  },
]

export const mockDataExportJobs: DataExportJob[] = [
  {
    id: 'ex-1',
    workspace_id: 'ws-1',
    scope: { decisions: true, logs: true, files: true },
    format: 'zip',
    status: 'completed',
    created_at: '2025-02-20T10:00:00Z',
    completed_at: '2025-02-20T10:05:00Z',
    s3_key: 'exports/ws-1-20250220.zip',
    download_url: '/downloads/ex-1',
    user_id: 'usr-1',
  },
  {
    id: 'ex-2',
    workspace_id: 'ws-3',
    scope: { decisions: true, logs: true, files: false },
    format: 'zip',
    status: 'running',
    created_at: new Date().toISOString(),
    user_id: 'usr-3',
  },
  {
    id: 'ex-3',
    workspace_id: 'ws-2',
    scope: { decisions: true, logs: true, files: true },
    format: 'tar',
    status: 'queued',
    created_at: new Date(Date.now() - 60000).toISOString(),
    user_id: 'usr-2',
  },
]

export const mockRetentionPolicies: RetentionPolicy[] = [
  {
    id: 'rp-1',
    workspace_id: 'ws-1',
    policy_name: 'Default audit retention',
    mode: 'archive',
    duration_days: 365,
    schedule_cron: '0 2 * * 0',
    criteria: { scope: 'audit_logs' },
    legal_hold: false,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
  },
  {
    id: 'rp-2',
    workspace_id: 'ws-1',
    policy_name: 'User data retention',
    mode: 'delete',
    duration_days: 730,
    legal_hold: false,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2025-02-01T00:00:00Z',
  },
  {
    id: 'rp-3',
    workspace_id: 'ws-3',
    policy_name: 'Legal hold - Acme matter',
    mode: 'archive',
    duration_days: 0,
    legal_hold: true,
    created_at: '2025-02-10T00:00:00Z',
    updated_at: '2025-02-10T00:00:00Z',
  },
]

export const mockWorkspaces = [
  { id: 'ws-1', name: 'Acme Design Studio' },
  { id: 'ws-2', name: 'Beta Agency' },
  { id: 'ws-3', name: 'Gamma Workspace' },
] as const

export const mockPrivacyControls: PrivacyControl[] = [
  {
    id: 'pc-1',
    workspace_id: 'ws-1',
    masking_rules: [
      { field: 'email', type: 'partial', show_last: 4 },
      { field: 'phone', type: 'full' },
    ],
    data_categories: ['pii', 'financial', 'decisions'],
    data_owner_id: 'usr-1',
    access_controls: { export_scope: 'workspace', require_approval: true },
    last_applied_at: '2025-02-20T10:00:00Z',
  },
]

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function mockFetchAuditLogs(filters?: {
  workspace_id?: string
  user_id?: string
  action?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}) {
  await delay(300)
  let items = [...mockAuditLogs]
  if (filters?.workspace_id) {
    items = items.filter((l) => l.workspace_id === filters.workspace_id)
  }
  if (filters?.user_id) {
    items = items.filter((l) => l.user_id === filters.user_id)
  }
  if (filters?.action) {
    items = items.filter((l) => l.action === filters.action)
  }
  const limit = filters?.limit ?? 50
  const offset = filters?.offset ?? 0
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
  }
}

export async function mockFetchExportJobs(workspaceId?: string) {
  await delay(200)
  if (workspaceId) {
    return mockDataExportJobs.filter((j) => j.workspace_id === workspaceId)
  }
  return mockDataExportJobs
}

export async function mockFetchRetentionPolicies(workspaceId?: string) {
  await delay(200)
  if (workspaceId) {
    return mockRetentionPolicies.filter((p) => p.workspace_id === workspaceId)
  }
  return mockRetentionPolicies
}

export async function mockFetchPrivacyControls(workspaceId?: string) {
  await delay(200)
  if (workspaceId) {
    const pc = mockPrivacyControls.find((p) => p.workspace_id === workspaceId)
    return pc ?? null
  }
  return mockPrivacyControls[0] ?? null
}

export const mockSystemHealth: SystemHealth = {
  captured_at: new Date().toISOString(),
  uptime_pct: 99.98,
  api_latency_ms: 42,
  errors_last_24h: 3,
  backlog_size: 0,
  redis_health: 'healthy',
}

export const mockComplianceStatus: ComplianceStatus = {
  audit_trail_verified: true,
  retention_policy_active: true,
  encryption_at_rest: true,
  encryption_in_transit: true,
  soc2_roadmap_status: 'in_progress',
  iso_roadmap_status: 'planned',
}

export async function mockFetchSystemHealth() {
  await delay(150)
  return mockSystemHealth
}

export async function mockFetchComplianceStatus() {
  await delay(150)
  return mockComplianceStatus
}
