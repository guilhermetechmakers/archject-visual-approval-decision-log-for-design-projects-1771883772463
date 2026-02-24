/**
 * Decisions List / Content Browser - types and filter state
 */

import type { DecisionStatus, TemplateType } from '@/types/workspace'

export interface DecisionListItem {
  id: string
  project_id: string
  title: string
  status: DecisionStatus
  due_date?: string | null
  assignee_id?: string | null
  assignee_name?: string | null
  template_id?: string | null
  template_type?: TemplateType | null
  summary?: string | null
  description?: string | null
  options_count?: number
  files_count?: number
  has_share_link?: boolean
  share_link_status?: 'active' | 'expired' | null
  created_at: string
  updated_at: string
  last_activity?: string | null
  metadata?: Record<string, unknown>
  tags?: string[]
}

export interface DecisionPreview extends DecisionListItem {
  options?: Array<{ key: string; value: string }>
  metadata?: Record<string, unknown>
  recent_activity?: Array<{ action: string; actor?: string; changed_at: string }>
}

export interface DecisionsListFilters {
  search?: string
  status?: DecisionStatus[]
  assigneeId?: string
  templateType?: TemplateType
  dueDateFrom?: string
  dueDateTo?: string
  quickFilter?: 'my_decisions' | 'awaiting_client' | 'overdue'
  tags?: string[]
  metadataKey?: string
  metadataValue?: string
}

export type DecisionsSortField = 'title' | 'due_date' | 'updated_at' | 'status'
export type DecisionsSortOrder = 'asc' | 'desc'

export interface DecisionsListParams {
  projectId: string
  filters?: DecisionsListFilters
  sort?: DecisionsSortField
  order?: DecisionsSortOrder
  page?: number
  pageSize?: number
}

export interface DecisionsListResponse {
  decisions: DecisionListItem[]
  total: number
  page: number
  pageSize: number
}

export interface BulkExportPayload {
  decisionIds: string[]
  format: 'pdf' | 'csv' | 'json'
}

export interface BulkSharePayload {
  decisionIds: string[]
  recipients?: string[]
}

export interface BulkChangeStatusPayload {
  decisionIds: string[]
  newStatus: DecisionStatus
}
