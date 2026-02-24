/**
 * Project Workspace data models - aligns with backend schema
 */

export type ProjectStatus = 'active' | 'archived' | 'on_hold'

export type DecisionStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export type FileType = 'drawing' | 'spec' | 'image' | 'BIM'

export type TemplateType = 'finishes' | 'layouts' | 'change_request'

export type TeamRole = 'owner' | 'editor' | 'viewer' | 'client'

export type ActivityType =
  | 'decision_created'
  | 'approval'
  | 'comment'
  | 'upload'
  | 'status_change'
  | 'link_shared'
  | 'member_invited'

export interface Project {
  id: string
  name: string
  workspace_id?: string
  client_id?: string | null
  client_name?: string | null
  branding_logo_url?: string | null
  branding_color?: string | null
  domain_prefix?: string | null
  storage_quota_bytes: number
  current_storage_bytes: number
  status: ProjectStatus
  deadline?: string | null
  project_type?: string | null
  created_at: string
  updated_at: string
  archived?: boolean
}

export interface Decision {
  id: string
  project_id: string
  title: string
  status: DecisionStatus
  due_date?: string | null
  assignee_id?: string | null
  assignee_name?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
  description?: string | null
  template_id?: string | null
  approved_at?: string | null
  options_count?: number
}

export interface DecisionOption {
  id: string
  decision_id: string
  title: string
  description?: string | null
  media_url?: string | null
  order: number
  version: number
}

export interface ProjectFile {
  id: string
  project_id: string
  file_name: string
  file_type: FileType
  file_url: string
  version: number
  uploaded_by?: string | null
  uploaded_at: string
  associated_decision_id?: string | null
  is_preview_generated?: boolean
  mime_type?: string | null
}

export interface TeamMember {
  id: string
  project_id: string
  user_id: string
  name: string
  email?: string | null
  avatar_url?: string | null
  role: TeamRole
  permissions_json?: Record<string, unknown>
  invited_at?: string | null
  accepted_at?: string | null
}

export interface Template {
  id: string
  name: string
  type: TemplateType
  content_json?: Record<string, unknown>
  created_at: string
  updated_at?: string | null
}

export interface ActivityLog {
  id: string
  project_id: string
  type: ActivityType
  reference_id?: string | null
  details_json?: Record<string, unknown>
  created_at: string
  summary?: string
  actor?: string | null
}

export interface ClientLink {
  id: string
  project_id: string
  decision_id?: string | null
  url: string
  expires_at?: string | null
  otp_required: boolean
  created_at: string
  used_at?: string | null
  is_active: boolean
}

export interface Webhook {
  id: string
  project_id: string
  event_type: string
  target_url: string
  last_trigger_at?: string | null
  attempts: number
  status: 'active' | 'paused' | 'failed'
}

export interface Task {
  id: string
  project_id: string
  related_decision_id?: string | null
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  due_at?: string | null
  created_by?: string | null
  assigned_to?: string | null
  created_at: string
  completed_at?: string | null
}

export interface ExportJob {
  id: string
  project_id: string
  type: 'pdf' | 'csv' | 'json'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  file_url?: string | null
  created_at: string
  user_id?: string | null
}

export interface SearchFilters {
  projects?: string[]
  decision_status?: DecisionStatus[]
  file_type?: FileType[]
  assignee?: string[]
  tags?: string[]
  date_from?: string
  date_to?: string
}

export interface SearchResult {
  type: 'project' | 'decision' | 'file' | 'comment'
  id: string
  title: string
  snippet?: string
  project_id?: string
  project_name?: string
  metadata?: Record<string, unknown>
}
