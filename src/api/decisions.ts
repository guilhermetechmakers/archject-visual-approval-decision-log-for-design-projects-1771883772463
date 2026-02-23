/**
 * Decision CRUD API - Create, Read, Update, Delete decisions
 */

import { api } from '@/lib/api'
import type { Decision } from '@/types/workspace'

export interface CreateDecisionPayload {
  title: string
  description?: string
  template_id?: string | null
  due_date?: string | null
  priority?: 'low' | 'medium' | 'high'
  status: 'draft' | 'pending'
  assignee_id?: string | null
  options?: Array<{
    title: string
    description?: string
    order: number
    caption?: string
    cost?: string
    media_files?: Array<{
      file_name: string
      url: string
      type: string
      version: number
      is_primary?: boolean
    }>
  }>
  approval_rules?: Array<{
    approver_id: string
    required: boolean
    deadline?: string
    allow_comments: boolean
  }>
  reminders?: Array<{
    schedule_type: string
    schedule_value: string
    message: string
    channel: string
    enabled: boolean
  }>
  triggers?: Array<{
    type: 'webhook' | 'task'
    target_url?: string
    payload_template?: string
    active: boolean
    outcome?: string
  }>
}

export async function createDecision(
  projectId: string,
  payload: CreateDecisionPayload
): Promise<Decision> {
  return api.post<Decision>(`/projects/${projectId}/decisions`, payload)
}

export async function fetchDecision(decisionId: string): Promise<Decision> {
  return api.get<Decision>(`/decisions/${decisionId}`)
}

export async function updateDecision(
  decisionId: string,
  payload: Partial<CreateDecisionPayload>
): Promise<Decision> {
  return api.patch<Decision>(`/decisions/${decisionId}`, payload)
}

export async function deleteDecision(decisionId: string): Promise<void> {
  return api.delete(`/decisions/${decisionId}`)
}
