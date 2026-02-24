/**
 * Security, Privacy & Compliance - Data Governance API.
 * Endpoints: audit-logs, exports, retention-policies, privacy-controls.
 * Falls back to mock data when API is unavailable.
 */

import { api } from '@/lib/api'
import type {
  AuditLog,
  AuditLogFilters,
  DataExportJob,
  CreateExportJobRequest,
  RetentionPolicy,
  CreateRetentionPolicyRequest,
  PrivacyControl,
  UpdatePrivacyControlRequest,
  SystemHealth,
  ComplianceStatus,
} from '@/types/governance'
import {
  mockFetchAuditLogs,
  mockFetchExportJobs,
  mockFetchRetentionPolicies,
  mockFetchPrivacyControls,
  mockFetchSystemHealth,
  mockFetchComplianceStatus,
  mockDataExportJobs,
  mockRetentionPolicies,
  mockPrivacyControls,
} from '@/lib/governance-mock'

const API_BASE = '/v1'
const USE_MOCK = !import.meta.env.VITE_API_URL

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function fetchAuditLogs(
  filters?: AuditLogFilters
): Promise<{ items: AuditLog[]; total: number }> {
  if (USE_MOCK) {
    return mockFetchAuditLogs(filters)
  }
  try {
    const params = new URLSearchParams()
    if (filters?.workspace_id) params.set('workspace_id', filters.workspace_id)
    if (filters?.project_id) params.set('project_id', filters.project_id)
    if (filters?.user_id) params.set('user_id', filters.user_id)
    if (filters?.action) params.set('action', filters.action)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    if (filters?.limit) params.set('limit', String(filters.limit))
    if (filters?.offset) params.set('offset', String(filters.offset))
    const qs = params.toString()
    return api.get<{ items: AuditLog[]; total: number }>(
      `${API_BASE}/audit-logs${qs ? `?${qs}` : ''}`
    )
  } catch {
    return mockFetchAuditLogs(filters)
  }
}

export async function fetchExportJobs(workspaceId?: string): Promise<DataExportJob[]> {
  if (USE_MOCK) {
    return mockFetchExportJobs(workspaceId)
  }
  try {
    const qs = workspaceId ? `?workspace_id=${workspaceId}` : ''
    return api.get<DataExportJob[]>(`${API_BASE}/exports${qs}`)
  } catch {
    return mockFetchExportJobs(workspaceId)
  }
}

export async function fetchExportJob(jobId: string): Promise<DataExportJob> {
  if (USE_MOCK) {
    await delay(150)
    const job = mockDataExportJobs.find((j) => j.id === jobId)
    if (job) return job
    throw new Error('Export job not found')
  }
  return api.get<DataExportJob>(`${API_BASE}/exports/${jobId}`)
}

export async function createExportJob(
  data: CreateExportJobRequest
): Promise<DataExportJob> {
  if (USE_MOCK) {
    await delay(400)
    return {
      id: `ex_${Date.now()}`,
      workspace_id: data.workspace_id,
      scope: data.scope,
      format: data.format,
      status: 'queued',
      created_at: new Date().toISOString(),
      user_id: 'current-user',
    }
  }
  return api.post<DataExportJob>(`${API_BASE}/exports`, data)
}

export async function abortExportJob(jobId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300)
    return
  }
  return api.post<void>(`${API_BASE}/exports/${jobId}/abort`, {})
}

export async function retryExportJob(jobId: string): Promise<DataExportJob> {
  if (USE_MOCK) {
    await delay(400)
    const job = mockDataExportJobs.find((j) => j.id === jobId)
    if (job) return { ...job, status: 'queued' as const }
    throw new Error('Export job not found')
  }
  return api.post<DataExportJob>(`${API_BASE}/exports/${jobId}/retry`, {})
}

export async function fetchRetentionPolicies(
  workspaceId?: string
): Promise<RetentionPolicy[]> {
  if (USE_MOCK) {
    return mockFetchRetentionPolicies(workspaceId)
  }
  try {
    const qs = workspaceId ? `?workspace_id=${workspaceId}` : ''
    return api.get<RetentionPolicy[]>(`${API_BASE}/retention-policies${qs}`)
  } catch {
    return mockFetchRetentionPolicies(workspaceId)
  }
}

export async function createRetentionPolicy(
  data: CreateRetentionPolicyRequest
): Promise<RetentionPolicy> {
  if (USE_MOCK) {
    await delay(400)
    return {
      id: `rp_${Date.now()}`,
      workspace_id: data.workspace_id,
      policy_name: data.policy_name,
      mode: data.mode,
      duration_days: data.duration_days,
      schedule_cron: data.schedule_cron ?? null,
      criteria: data.criteria ?? null,
      legal_hold: data.legal_hold ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  return api.post<RetentionPolicy>(`${API_BASE}/retention-policies`, data)
}

export async function updateRetentionPolicy(
  id: string,
  data: Partial<CreateRetentionPolicyRequest>
): Promise<RetentionPolicy> {
  if (USE_MOCK) {
    await delay(300)
    const existing = mockRetentionPolicies.find((p) => p.id === id)
    if (!existing) throw new Error('Policy not found')
    return { ...existing, ...data, updated_at: new Date().toISOString() }
  }
  return api.put<RetentionPolicy>(`${API_BASE}/retention-policies/${id}`, data)
}

export async function deleteRetentionPolicy(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(300)
    return
  }
  return api.delete<void>(`${API_BASE}/retention-policies/${id}`)
}

export async function fetchPrivacyControls(
  workspaceId?: string
): Promise<PrivacyControl | null> {
  if (USE_MOCK) {
    return mockFetchPrivacyControls(workspaceId)
  }
  try {
    const qs = workspaceId ? `?workspace_id=${workspaceId}` : ''
    return api.get<PrivacyControl | null>(`${API_BASE}/privacy-controls${qs}`)
  } catch {
    return mockFetchPrivacyControls(workspaceId)
  }
}

export async function updatePrivacyControls(
  workspaceId: string,
  data: UpdatePrivacyControlRequest
): Promise<PrivacyControl> {
  if (USE_MOCK) {
    await delay(400)
    const existing = mockPrivacyControls.find((p) => p.workspace_id === workspaceId)
    return {
      id: existing?.id ?? `pc_${Date.now()}`,
      workspace_id: workspaceId,
      ...existing,
      ...data,
      last_applied_at: new Date().toISOString(),
    }
  }
  return api.put<PrivacyControl>(`${API_BASE}/privacy-controls`, {
    workspace_id: workspaceId,
    ...data,
  })
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
  if (USE_MOCK) return mockFetchSystemHealth()
  try {
    return api.get<SystemHealth>(`${API_BASE}/system-health`)
  } catch {
    return mockFetchSystemHealth()
  }
}

export async function fetchComplianceStatus(): Promise<ComplianceStatus> {
  if (USE_MOCK) return mockFetchComplianceStatus()
  try {
    return api.get<ComplianceStatus>(`${API_BASE}/compliance-status`)
  } catch {
    return mockFetchComplianceStatus()
  }
}
