/**
 * Edit / Manage Decision Page - types for versioned decisions, objects, audit, share
 */

import type { DecisionStatus } from '@/types/workspace'

export interface DecisionObject {
  id: string
  decision_id: string
  title: string
  description?: string | null
  order_index: number
  status: DecisionStatus
  metadata?: Record<string, unknown>
  options: DecisionOption[]
  created_at: string
  updated_at: string
}

export interface DecisionOption {
  id: string
  decision_object_id: string
  label: string
  media_url?: string | null
  cost?: number | string | null
  dependencies?: Record<string, unknown>
  order_index: number
}

export interface DecisionVersion {
  id: string
  decision_id: string
  version_number: number
  snapshot: DecisionVersionSnapshot
  created_at: string
  author_id?: string | null
  author_name?: string | null
  note?: string | null
}

export interface DecisionMetadata {
  title?: string
  description?: string | null
  category?: string | null
  owner_id?: string | null
  owner_name?: string | null
  due_date?: string | null
  tags?: string[]
  custom?: Record<string, unknown>
}

export interface DecisionVersionSnapshot {
  title: string
  description?: string | null
  category?: string | null
  owner_id?: string | null
  due_date?: string | null
  tags?: string[]
  metadata?: Record<string, unknown>
  decision_objects: DecisionObject[]
}

export interface VersionedDecision {
  id: string
  project_id: string
  title: string
  description?: string | null
  category?: string | null
  owner_id?: string | null
  status: DecisionStatus
  current_version_id: string
  current_version_number?: number
  created_at: string
  updated_at: string
  due_date?: string | null
  tags?: string[]
  metadata?: DecisionMetadata
  decision_objects?: DecisionObject[]
  current_version?: DecisionVersion
}

export interface AuditLogEntry {
  id: string
  decision_id: string
  version_id?: string | null
  action: AuditAction
  user_id?: string | null
  user_name?: string | null
  timestamp: string
  details?: Record<string, unknown>
}

export type AuditAction =
  | 'created'
  | 'updated'
  | 'status_change'
  | 'approval'
  | 'comment'
  | 'reissue'
  | 'object_added'
  | 'object_removed'
  | 'object_updated'

export interface ShareLink {
  id: string
  decision_id: string
  url: string
  expires_at?: string | null
  access_scope: 'read' | 'read_write'
  created_by?: string | null
  is_active: boolean
  created_at: string
}

export interface ReissueSharePayload {
  expires_at?: string
  access_scope?: 'read' | 'read_write'
  audience?: string[]
  read_only?: boolean
}

export interface FieldDiff {
  field: string
  path: string
  oldValue: unknown
  newValue: unknown
  type: 'added' | 'removed' | 'modified'
}

export interface VersionDiff {
  from_version_id: string
  to_version_id: string
  fields: FieldDiff[]
  metadata_diffs: FieldDiff[]
  options_diffs: FieldDiff[]
  media_diffs: FieldDiff[]
  comments_diffs: FieldDiff[]
}
