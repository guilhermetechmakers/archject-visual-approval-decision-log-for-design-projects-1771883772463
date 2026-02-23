/**
 * Decisions List API - RESTful endpoints for decisions CRUD and bulk actions
 */

import { api } from '@/lib/api'
import type {
  DecisionPreview,
  DecisionsListParams,
  DecisionsListResponse,
  BulkExportPayload,
  BulkSharePayload,
  BulkChangeStatusPayload,
} from '@/types/decisions-list'
import type { Decision } from '@/types/workspace'

export async function fetchDecisionsList(
  params: DecisionsListParams
): Promise<DecisionsListResponse> {
  const { projectId, filters, sort = 'updated_at', order = 'desc', page = 1, pageSize = 25 } = params
  const qs = new URLSearchParams()
  if (filters?.search) qs.set('search', filters.search)
  if (filters?.status?.length) qs.set('status', filters.status.join(','))
  if (filters?.assigneeId) qs.set('assigneeId', filters.assigneeId)
  if (filters?.templateType) qs.set('templateType', filters.templateType)
  if (filters?.dueDateFrom) qs.set('dueDateFrom', filters.dueDateFrom)
  if (filters?.dueDateTo) qs.set('dueDateTo', filters.dueDateTo)
  if (filters?.quickFilter) qs.set('quickFilter', filters.quickFilter)
  qs.set('sort', sort)
  qs.set('order', order)
  qs.set('page', String(page))
  qs.set('pageSize', String(pageSize))
  const query = qs.toString()
  return api.get<DecisionsListResponse>(
    `/projects/${projectId}/decisions${query ? `?${query}` : ''}`
  )
}

export async function fetchDecisionPreview(
  projectId: string,
  decisionId: string
): Promise<DecisionPreview> {
  return api.get<DecisionPreview>(
    `/projects/${projectId}/decisions/${decisionId}/preview`
  )
}

export async function createDecision(
  projectId: string,
  data: {
    title: string
    status?: string
    due_date?: string
    assignee_id?: string
    template_id?: string
    summary?: string
    metadata?: Record<string, unknown>
    options?: Record<string, unknown>
  }
): Promise<Decision> {
  return api.post<Decision>(`/projects/${projectId}/decisions`, data)
}

export async function updateDecision(
  projectId: string,
  decisionId: string,
  data: Partial<{
    title: string
    status: string
    due_date: string
    assignee_id: string
    summary: string
    metadata: Record<string, unknown>
    options: Record<string, unknown>
  }>
): Promise<Decision> {
  return api.patch<Decision>(
    `/projects/${projectId}/decisions/${decisionId}`,
    data
  )
}

export async function deleteDecision(
  projectId: string,
  decisionId: string
): Promise<void> {
  return api.delete(`/projects/${projectId}/decisions/${decisionId}`)
}

export async function cloneDecision(
  projectId: string,
  decisionId: string
): Promise<Decision> {
  return api.post<Decision>(
    `/projects/${projectId}/decisions/${decisionId}/clone`,
    {}
  )
}

export async function bulkExport(
  projectId: string,
  payload: BulkExportPayload
): Promise<{ job_id: string; status: string }> {
  return api.post(`/projects/${projectId}/decisions/bulk/export`, payload)
}

export async function bulkShare(
  projectId: string,
  payload: BulkSharePayload
): Promise<{ links: Array<{ decision_id: string; url: string }> }> {
  return api.post(`/projects/${projectId}/decisions/bulk/share`, payload)
}

export async function bulkChangeStatus(
  projectId: string,
  payload: BulkChangeStatusPayload
): Promise<void> {
  return api.post(`/projects/${projectId}/decisions/bulk/change-status`, payload)
}
