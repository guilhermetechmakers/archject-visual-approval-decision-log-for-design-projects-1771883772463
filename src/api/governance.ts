/**
 * Security, Privacy & Compliance - Data Governance API.
 * Endpoints: audit-logs, exports, retention-policies, privacy-controls.
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
} from '@/types/governance'

const API_BASE = '/v1'

export async function fetchAuditLogs(
  filters?: AuditLogFilters
): Promise<{ items: AuditLog[]; total: number }> {
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
}

export async function fetchExportJobs(workspaceId?: string): Promise<DataExportJob[]> {
  const qs = workspaceId ? `?workspace_id=${workspaceId}` : ''
  return api.get<DataExportJob[]>(`${API_BASE}/exports${qs}`)
}

export async function fetchExportJob(jobId: string): Promise<DataExportJob> {
  return api.get<DataExportJob>(`${API_BASE}/exports/${jobId}`)
}

export async function createExportJob(
  data: CreateExportJobRequest
): Promise<DataExportJob> {
  return api.post<DataExportJob>(`${API_BASE}/exports`, data)
}

export async function abortExportJob(jobId: string): Promise<void> {
  return api.post<void>(`${API_BASE}/exports/${jobId}/abort`, {})
}

export async function retryExportJob(jobId: string): Promise<DataExportJob> {
  return api.post<DataExportJob>(`${API_BASE}/exports/${jobId}/retry`, {})
}

export async function fetchRetentionPolicies(
  workspaceId?: string
): Promise<RetentionPolicy[]> {
  const qs = workspaceId ? `?workspace_id=${workspaceId}` : ''
  return api.get<RetentionPolicy[]>(`${API_BASE}/retention-policies${qs}`)
}

export async function createRetentionPolicy(
  data: CreateRetentionPolicyRequest
): Promise<RetentionPolicy> {
  return api.post<RetentionPolicy>(`${API_BASE}/retention-policies`, data)
}

export async function updateRetentionPolicy(
  id: string,
  data: Partial<CreateRetentionPolicyRequest>
): Promise<RetentionPolicy> {
  return api.put<RetentionPolicy>(`${API_BASE}/retention-policies/${id}`, data)
}

export async function deleteRetentionPolicy(id: string): Promise<void> {
  return api.delete<void>(`${API_BASE}/retention-policies/${id}`)
}

export async function fetchPrivacyControls(
  workspaceId?: string
): Promise<PrivacyControl | null> {
  const qs = workspaceId ? `?workspace_id=${workspaceId}` : ''
  return api.get<PrivacyControl | null>(`${API_BASE}/privacy-controls${qs}`)
}

export async function updatePrivacyControls(
  workspaceId: string,
  data: UpdatePrivacyControlRequest
): Promise<PrivacyControl> {
  return api.put<PrivacyControl>(`${API_BASE}/privacy-controls`, {
    workspace_id: workspaceId,
    ...data,
  })
}
