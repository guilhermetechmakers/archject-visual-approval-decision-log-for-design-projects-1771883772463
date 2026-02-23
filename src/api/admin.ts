/**
 * Admin API - stubs ready for backend integration.
 * Endpoints: GET /admin/dashboard/summary, GET /admin/accounts, etc.
 * Falls back to mock data when API is unavailable.
 */

import { api } from '@/lib/api'
import type {
  DashboardSummary,
  Workspace,
  Dispute,
  BillingException,
  FeatureToggle,
  ExportJob,
  RetentionPolicy,
  AdminAuditLog,
} from '@/types/admin'
import {
  mockDashboardSummary,
  mockWorkspaces,
  mockDisputes,
  mockBillingExceptions,
  mockFeatureToggles,
  mockExportJobs,
  mockRetentionPolicies,
  mockAuditLogs,
  mockHealthHistory,
} from '@/lib/admin-mock'
import type { SystemHealth } from '@/types/admin'

const USE_MOCK = !import.meta.env.VITE_API_URL

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function fetchAdminDashboardSummary(): Promise<DashboardSummary> {
  if (USE_MOCK) {
    await delay(400)
    return mockDashboardSummary
  }
  try {
    return await api.get<DashboardSummary>('/admin/dashboard/summary')
  } catch {
    return mockDashboardSummary
  }
}

export async function fetchAdminWorkspaces(): Promise<Workspace[]> {
  if (USE_MOCK) {
    await delay(300)
    return mockWorkspaces
  }
  try {
    return await api.get<Workspace[]>('/admin/accounts')
  } catch {
    return mockWorkspaces
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

export async function fetchAdminAuditLogs(): Promise<AdminAuditLog[]> {
  if (USE_MOCK) {
    await delay(300)
    return mockAuditLogs
  }
  try {
    return await api.get<AdminAuditLog[]>('/admin/audit-logs')
  } catch {
    return mockAuditLogs
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

export async function postWorkspaceImpersonate(workspaceId: string): Promise<{ token: string }> {
  if (USE_MOCK) {
    await delay(500)
    return { token: `impersonate_${workspaceId}_${Date.now()}` }
  }
  return api.post<{ token: string }>(`/admin/workspaces/${workspaceId}/impersonate`, {})
}

export async function postWorkspaceEscalate(workspaceId: string, notes: string): Promise<void> {
  if (USE_MOCK) {
    await delay(400)
    return
  }
  await api.post(`/admin/workspaces/${workspaceId}/escalate`, { notes })
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
