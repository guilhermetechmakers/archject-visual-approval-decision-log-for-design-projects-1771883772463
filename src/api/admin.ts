/**
 * Admin API - stubs ready for backend integration.
 * Endpoints: GET /admin/dashboard/summary, GET /admin/accounts, etc.
 * Falls back to mock data when API is unavailable.
 */

import { api } from '@/lib/api'
import type {
  DashboardSummary,
  Workspace,
  AdminUser,
  Dispute,
  BillingException,
  FeatureToggle,
  ExportJob,
  RetentionPolicy,
  AdminAuditLog,
  Escalation,
} from '@/types/admin'
import {
  mockDashboardSummary,
  mockWorkspaces,
  mockUsers,
  mockDisputes,
  mockBillingExceptions,
  mockFeatureToggles,
  mockExportJobs,
  mockRetentionPolicies,
  mockAuditLogs,
  mockEscalations,
  mockHealthHistory,
} from '@/lib/admin-mock'
import type { SystemHealth } from '@/types/admin'

const USE_MOCK = !import.meta.env.VITE_API_URL

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface AdminWorkspacesFilters {
  status?: string
  plan?: string
  domain?: string
  owner_email?: string
  workspace_id?: string
  search?: string
  activity_from?: string
  activity_to?: string
}

export interface AdminUsersFilters {
  status?: string
  role?: string
  workspace_id?: string
  search?: string
  activity_from?: string
  activity_to?: string
}

export interface AdminAuditFilters {
  actor_id?: string
  workspace_id?: string
  action_type?: string
  limit?: number
}

export interface AdminDashboardFilters {
  range?: '7d' | '30d' | '90d'
  account?: string
  region?: string
}

export async function fetchAdminDashboardSummary(
  filters?: AdminDashboardFilters
): Promise<DashboardSummary> {
  if (USE_MOCK) {
    await delay(400)
    return mockDashboardSummary
  }
  try {
    const params = new URLSearchParams(filters as Record<string, string>).toString()
    return await api.get<DashboardSummary>(`/admin/dashboard/summary?${params}`)
  } catch {
    return mockDashboardSummary
  }
}

export async function fetchAdminWorkspaces(filters?: AdminWorkspacesFilters): Promise<Workspace[]> {
  if (USE_MOCK) {
    await delay(300)
    let result = [...mockWorkspaces]
    if (filters?.status) {
      result = result.filter((w) => w.status === filters.status)
    }
    if (filters?.plan) {
      result = result.filter((w) => w.plan === filters.plan)
    }
    if (filters?.domain) {
      result = result.filter((w) => (w.domain ?? '').toLowerCase().includes((filters.domain ?? '').toLowerCase()))
    }
    if (filters?.owner_email) {
      result = result.filter((w) =>
        (w.owner_email ?? '').toLowerCase().includes((filters.owner_email ?? '').toLowerCase())
      )
    }
    if (filters?.workspace_id) {
      result = result.filter((w) => w.id.toLowerCase().includes((filters.workspace_id ?? '').toLowerCase()))
    }
    if (filters?.search) {
      const q = (filters.search ?? '').toLowerCase()
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.id.toLowerCase().includes(q) ||
          (w.domain ?? '').toLowerCase().includes(q) ||
          (w.owner_email ?? '').toLowerCase().includes(q) ||
          (w.owner_name ?? '').toLowerCase().includes(q)
      )
    }
    return result
  }
  try {
    const params = new URLSearchParams(filters as Record<string, string>).toString()
    return await api.get<Workspace[]>(`/admin/workspaces?${params}`)
  } catch {
    return mockWorkspaces
  }
}

export async function fetchAdminUsers(filters?: AdminUsersFilters): Promise<AdminUser[]> {
  if (USE_MOCK) {
    await delay(300)
    let result = [...mockUsers]
    if (filters?.status && filters.status !== 'all')
      result = result.filter((u) => u.status === filters!.status)
    if (filters?.role && filters.role !== 'all')
      result = result.filter((u) => u.role === filters!.role)
    if (filters?.search) {
      const q = (filters.search ?? '').toLowerCase()
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name ?? '').toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      )
    }
    return result
  }
  try {
    const params = new URLSearchParams(filters as Record<string, string>).toString()
    return await api.get<AdminUser[]>(`/admin/users?${params}`)
  } catch {
    return mockUsers
  }
}

export async function fetchAdminDisputes(): Promise<Dispute[]> {
  if (USE_MOCK) {
    await delay(250)
    return mockDisputes
  }
  try {
    return await api.get<Dispute[]>('/admin/disputes')
  } catch {
    return mockDisputes
  }
}

export async function fetchAdminBillingExceptions(): Promise<BillingException[]> {
  if (USE_MOCK) {
    await delay(250)
    return mockBillingExceptions
  }
  try {
    return await api.get<BillingException[]>('/admin/billing/exceptions')
  } catch {
    return mockBillingExceptions
  }
}

export async function fetchAdminFeatureToggles(): Promise<FeatureToggle[]> {
  if (USE_MOCK) {
    await delay(200)
    return mockFeatureToggles
  }
  try {
    return await api.get<FeatureToggle[]>('/admin/features')
  } catch {
    return mockFeatureToggles
  }
}

export async function fetchAdminExportJobs(): Promise<ExportJob[]> {
  if (USE_MOCK) {
    await delay(200)
    return mockExportJobs
  }
  try {
    return await api.get<ExportJob[]>('/admin/exports')
  } catch {
    return mockExportJobs
  }
}

export async function fetchAdminRetentionPolicies(): Promise<RetentionPolicy[]> {
  if (USE_MOCK) {
    await delay(200)
    return mockRetentionPolicies
  }
  try {
    return await api.get<RetentionPolicy[]>('/admin/retention-policies')
  } catch {
    return mockRetentionPolicies
  }
}

export async function fetchAdminAuditLogs(filters?: AdminAuditFilters): Promise<AdminAuditLog[]> {
  if (USE_MOCK) {
    await delay(300)
    let result = [...mockAuditLogs]
    if (filters?.action_type)
      result = result.filter((l) => l.action === filters!.action_type || l.action_type === filters!.action_type)
    if (filters?.actor_id)
      result = result.filter((l) => (l.admin_id ?? l.actor_id ?? '').toLowerCase().includes((filters!.actor_id ?? '').toLowerCase()))
    return result
  }
  try {
    const params = new URLSearchParams(filters as Record<string, string>).toString()
    return await api.get<AdminAuditLog[]>(`/admin/audits?${params}`)
  } catch {
    return mockAuditLogs
  }
}

export async function fetchAdminEscalations(): Promise<Escalation[]> {
  if (USE_MOCK) {
    await delay(250)
    return mockEscalations
  }
  try {
    return await api.get<Escalation[]>('/admin/escalations')
  } catch {
    return mockEscalations
  }
}

export async function fetchAdminHealthHistory(): Promise<SystemHealth[]> {
  if (USE_MOCK) {
    await delay(200)
    return mockHealthHistory
  }
  try {
    return await api.get<SystemHealth[]>('/admin/health/history')
  } catch {
    return mockHealthHistory
  }
}

export async function postWorkspaceImpersonate(workspaceId: string, reason?: string): Promise<{ token: string }> {
  if (USE_MOCK) {
    await delay(500)
    return { token: `impersonate_${workspaceId}_${Date.now()}` }
  }
  return api.post<{ token: string }>(`/admin/impersonate`, { target_workspace_id: workspaceId, reason })
}

export async function postWorkspaceEscalate(workspaceId: string, notes: string): Promise<void> {
  if (USE_MOCK) {
    await delay(400)
    return
  }
  await api.post(`/admin/workspaces/${workspaceId}/escalate`, { notes })
}

export async function postWorkspaceDisable(workspaceId: string, reason: string): Promise<void> {
  if (USE_MOCK) {
    await delay(400)
    return
  }
  await api.post(`/admin/workspaces/${workspaceId}/disable`, { reason })
}

export async function postWorkspaceExport(workspaceId: string): Promise<ExportJob> {
  if (USE_MOCK) {
    await delay(500)
    return {
      id: `ex_${Date.now()}`,
      type: 'user_data',
      scope: `workspace:${workspaceId}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
  }
  return api.post<ExportJob>(`/admin/workspaces/${workspaceId}/export`, {})
}

export async function postWorkspaceRetention(
  workspaceId: string,
  policy: { duration_days: number; scope: string }
): Promise<void> {
  if (USE_MOCK) {
    await delay(400)
    return
  }
  await api.post(`/admin/workspaces/${workspaceId}/retention`, policy)
}

export async function postCreateEscalation(data: {
  workspace_id: string
  user_id?: string
  reason: string
  priority: Escalation['priority']
  notes?: string
  assigned_team?: string
}): Promise<Escalation> {
  if (USE_MOCK) {
    await delay(400)
    return {
      id: `esc_${Date.now()}`,
      workspace_id: data.workspace_id,
      user_id: data.user_id,
      reason: data.reason,
      priority: data.priority,
      status: 'open',
      created_at: new Date().toISOString(),
      created_by: 'admin-1',
      notes: data.notes,
      assigned_team: data.assigned_team,
    }
  }
  return api.post<Escalation>('/admin/escalations', data)
}

export async function postBulkWorkspaceDisable(workspaceIds: string[], reason: string): Promise<{ success: number; failed: number }> {
  if (USE_MOCK) {
    await delay(500)
    return { success: workspaceIds.length, failed: 0 }
  }
  return api.post<{ success: number; failed: number }>('/admin/workspaces/bulk-disable', {
    workspace_ids: workspaceIds,
    reason,
  })
}

export async function postUserSuspend(userId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300)
    return
  }
  await api.post(`/admin/users/${userId}/suspend`, {})
}

export async function postUserActivate(userId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300)
    return
  }
  await api.post(`/admin/users/${userId}/activate`, {})
}

export async function postUsersBulkUpdate(
  userIds: string[],
  updates: { status?: string }
): Promise<void> {
  if (USE_MOCK) {
    await delay(400)
    return
  }
  await api.post('/admin/users/bulk-update', { user_ids: userIds, ...updates })
}

export async function postDisputeResolve(disputeId: string, resolution: string): Promise<void> {
  if (USE_MOCK) {
    await delay(400)
    return
  }
  await api.post(`/admin/disputes/${disputeId}/resolve`, { resolution })
}

export async function postDisputeEscalate(disputeId: string, notes: string): Promise<void> {
  if (USE_MOCK) {
    await delay(400)
    return
  }
  await api.post(`/admin/disputes/${disputeId}/escalate`, { notes })
}

export async function postBillingExceptionApprove(exceptionId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300)
    return
  }
  await api.post(`/admin/billing/exceptions/${exceptionId}/approve`, {})
}

export async function postBillingExceptionReject(exceptionId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300)
    return
  }
  await api.post(`/admin/billing/exceptions/${exceptionId}/reject`, {})
}

export async function patchFeatureToggle(featureName: string, enabled: boolean, rolloutPercentage?: number): Promise<FeatureToggle> {
  if (USE_MOCK) {
    await delay(300)
    const toggles = mockFeatureToggles
    const t = toggles.find((x) => x.feature_name === featureName)
    if (t) {
      return { ...t, enabled, rollout_percentage: rolloutPercentage ?? t.rollout_percentage }
    }
    return { id: 'new', feature_name: featureName, enabled, rollout_percentage: rolloutPercentage ?? 100, environment: 'production' }
  }
  return api.patch<FeatureToggle>(`/admin/features/${featureName}`, { enabled, rollout_percentage: rolloutPercentage })
}

export async function postCreateExport(type: string, scope: string): Promise<ExportJob> {
  if (USE_MOCK) {
    await delay(400)
    return {
      id: `ex_${Date.now()}`,
      type,
      scope,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
  }
  return api.post<ExportJob>('/admin/exports', { type, scope })
}

export async function postAdminForceLogout(userId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300)
    return
  }
  await api.post(`/admin/users/${userId}/force-logout`, {})
}

export async function postMaintenanceWindow(params: {
  action: 'start' | 'stop'
  message?: string
  durationMinutes?: number
}): Promise<void> {
  if (USE_MOCK) {
    await delay(400)
    return
  }
  await api.post('/admin/maintenance-window', params)
}

export async function postImpersonationRevoke(sessionId?: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300)
    return
  }
  await api.post('/admin/impersonation/revoke', sessionId ? { session_id: sessionId } : {})
}

export async function postComplianceExport(data: {
  scope: string[]
  format: 'csv' | 'json' | 'pdf'
}): Promise<ExportJob> {
  if (USE_MOCK) {
    await delay(500)
    return {
      id: `ex_${Date.now()}`,
      type: 'compliance',
      scope: data.scope.join(','),
      status: 'pending',
      created_at: new Date().toISOString(),
    }
  }
  return api.post<ExportJob>('/admin/exports', {
    type: 'compliance',
    scope: data.scope,
    format: data.format,
  })
}
