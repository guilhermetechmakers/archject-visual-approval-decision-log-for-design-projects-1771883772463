import { api } from '@/lib/api'
import type {
  User,
  Invite,
  Role,
  Project,
  ActivityLog,
  SSOConfig,
  Branding,
  CreateInviteInput,
  CreateRoleInput,
  UpdateRoleInput,
  AssignRolesInput,
} from '@/types/team'

export interface TeamsResponse {
  users: User[]
  invites: Invite[]
  roles: Role[]
  projects: Project[]
}

export const teamApi = {
  getTeams: () => api.get<TeamsResponse>('/teams'),

  getInvites: () => api.get<Invite[]>('/teams/invites'),

  invite: (input: CreateInviteInput) =>
    api.post<Invite>('/teams/invite', input),

  createRole: (input: CreateRoleInput) =>
    api.post<Role>('/teams/roles', input),

  updateRole: (roleId: string, input: UpdateRoleInput) =>
    api.patch<Role>(`/teams/roles/${roleId}`, input),

  removeUser: (userId: string) =>
    api.delete<void>(`/teams/${userId}`),

  assignRoles: (userId: string, roles: AssignRolesInput[]) =>
    api.post<void>(`/teams/${userId}/roles`, { roles }),

  getProjectBranding: (projectId: string) =>
    api.get<Branding>(`/projects/${projectId}/branding`),

  getSSOConfig: () => api.get<SSOConfig>('/enterprise/sso'),

  configureSSO: (config: Partial<SSOConfig>) =>
    api.post<SSOConfig>('/enterprise/sso', config),

  getActivity: () => api.get<ActivityLog[]>('/activity'),

  initiateExport: () => api.post<{ exportId: string }>('/export'),

  getExportStatus: (exportId: string) =>
    api.get<{ status: string; downloadUrl?: string }>(`/export/${exportId}`),

  getRoles: () => api.get<Role[]>('/permissions/roles'),

  getRole: (roleId: string) => api.get<Role>(`/permissions/roles/${roleId}`),
}
