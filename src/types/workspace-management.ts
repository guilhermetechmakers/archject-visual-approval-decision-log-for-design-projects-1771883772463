/**
 * Project & Workspace Management types
 * Aligns with Supabase schema and API contracts
 */

export interface WorkspaceQuota {
  storage_bytes: number
  decisions_count: number
  file_size_bytes?: number
}

export interface WorkspaceUsage {
  storage_bytes: number
  decisions_count: number
  files_count: number
}

export interface Workspace {
  id: string
  name: string
  owner_user_id: string
  branding?: Branding | null
  quotas?: WorkspaceQuota
  usage?: WorkspaceUsage
  archived_at?: string | null
  created_at: string
  updated_at?: string
}

export interface Branding {
  id: string
  owner_type: 'workspace' | 'project'
  owner_id: string
  logo_url?: string | null
  primary_color?: string | null
  secondary_color?: string | null
  font_settings?: Record<string, unknown>
  banner_url?: string | null
  custom_css?: string | null
}

export interface ProjectQuota {
  storage_bytes: number
  decisions_count: number
}

export interface ProjectUsage {
  storage_bytes: number
  decisions_count: number
  files_count: number
}

export type ProjectStatus = 'active' | 'archived' | 'on_hold'

export interface Project {
  id: string
  workspace_id: string
  name: string
  client_info?: Record<string, unknown>
  branding_id?: string | null
  template_id?: string | null
  quota?: ProjectQuota
  usage?: ProjectUsage
  status: ProjectStatus
  archived_at?: string | null
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  workspace_id: string
  name: string
  client_info?: Record<string, unknown>
  branding?: Partial<Branding>
  template_id?: string
  quota?: ProjectQuota
}

export interface UpdateProjectInput {
  name?: string
  client_info?: Record<string, unknown>
  branding?: Partial<Branding>
  template_id?: string
  status?: ProjectStatus
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired'

export interface Invitation {
  id: string
  project_id: string
  email: string
  role: string
  token: string
  expires_at: string
  status: InvitationStatus
  created_at: string
}

export interface CreateInvitationInput {
  email: string
  role: string
  expires_at?: string
  scopes?: string[]
}

export type RBACScope = 'view' | 'edit' | 'invite' | 'manage_branding' | 'export' | 'archive'

export interface ProjectRBAC {
  id: string
  project_id: string
  user_id: string
  role: string
  scopes: RBACScope[]
  created_at: string
}

export interface AuditLogEntry {
  id: string
  actor_id: string | null
  action: string
  target_type?: string | null
  target_id: string | null
  timestamp: string
  details?: Record<string, unknown> | null
}
