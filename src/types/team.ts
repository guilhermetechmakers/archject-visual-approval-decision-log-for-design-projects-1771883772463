/** Team & Users data models */

export type UserStatus = 'active' | 'inactive'
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'rejected'

export interface ProjectRole {
  projectId: string
  roleId: string
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  lastActive?: string
  status: UserStatus
  timeZone?: string
  isClient: boolean
  globalRoles: string[]
  projectRoles: ProjectRole[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  branding?: Branding
  templates: string[]
  storageQuota: number
  currentStorageUsed: number
  createdAt: string
  updatedAt: string
}

export interface Branding {
  projectId: string
  logoUrl?: string
  colorScheme?: string
  typography?: string
  updatedAt: string
}

export interface RolePermissions {
  access?: boolean
  projectActions?: boolean
  adminActions?: boolean
  dataExport?: boolean
  integrations?: boolean
  sso?: boolean
  [key: string]: boolean | undefined
}

export const PERMISSION_DOMAINS = [
  { key: 'access', label: 'Access', permissions: ['access'] },
  { key: 'projectActions', label: 'Project Actions', permissions: ['projectActions'] },
  { key: 'adminActions', label: 'Admin Actions', permissions: ['adminActions'] },
  { key: 'dataExport', label: 'Data Export', permissions: ['dataExport'] },
  { key: 'integrations', label: 'Integrations', permissions: ['integrations'] },
  { key: 'sso', label: 'SSO', permissions: ['sso'] },
] as const

export interface ExportJob {
  id: string
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  progress?: number
}

export interface Role {
  id: string
  name: string
  permissions: RolePermissions
  isCustom: boolean
  createdBy?: string
  projectScoped: boolean
  createdAt: string
  updatedAt: string
}

export interface Invite {
  id: string
  email: string
  roleId: string
  projectsScoped: string[]
  message?: string
  status: InviteStatus
  sentAt: string
  expiresAt: string
  invitedBy: string
  createdAt: string
  updatedAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  targetId?: string
  timestamp: string
  details?: Record<string, unknown>
}

export interface SSOConfig {
  id: string
  enabled: boolean
  provider?: string
  metadataUrl?: string
  certificate?: string
  lastConfiguredAt?: string
}

export interface PermissionScope {
  id: string
  roleId: string
  projectId: string | null
  permissions: RolePermissions
}

export interface CreateInviteInput {
  email: string
  roleId: string
  projectsScoped: string[]
  message?: string
  expiresAt?: string
}

export interface CreateRoleInput {
  name: string
  permissions: RolePermissions
  isCustom: boolean
}

export interface UpdateRoleInput {
  name?: string
  permissions?: RolePermissions
}

export interface AssignRolesInput {
  projectId: string
  roleId: string
}
