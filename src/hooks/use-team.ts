import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamApi } from '@/api/team'
import type {
  CreateInviteInput,
  CreateRoleInput,
  UpdateRoleInput,
  AssignRolesInput,
} from '@/types/team'
import type { TeamsResponse } from '@/api/team'

/** Mock data for when API is unavailable */
const MOCK_USERS = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@studio.com',
    avatarUrl: undefined,
    lastActive: '2025-02-23T10:00:00Z',
    status: 'active' as const,
    timeZone: 'UTC',
    isClient: false,
    globalRoles: ['admin'],
    projectRoles: [{ projectId: 'p1', roleId: 'r1' }],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2025-02-23T10:00:00Z',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@studio.com',
    avatarUrl: undefined,
    lastActive: '2025-02-22T15:30:00Z',
    status: 'active' as const,
    timeZone: 'UTC',
    isClient: false,
    globalRoles: [],
    projectRoles: [{ projectId: 'p1', roleId: 'r2' }],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2025-02-22T15:30:00Z',
  },
  {
    id: '3',
    name: 'Alice Brown',
    email: 'alice@studio.com',
    avatarUrl: undefined,
    lastActive: '2025-02-20T09:00:00Z',
    status: 'active' as const,
    timeZone: 'UTC',
    isClient: false,
    globalRoles: [],
    projectRoles: [{ projectId: 'p1', roleId: 'r3' }],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2025-02-20T09:00:00Z',
  },
]

const MOCK_ROLES = [
  {
    id: 'r1',
    name: 'Admin',
    permissions: { access: true, projectActions: true, adminActions: true, dataExport: true, integrations: true, sso: true },
    isCustom: false,
    projectScoped: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'r2',
    name: 'Project Lead',
    permissions: { access: true, projectActions: true, adminActions: false, dataExport: true, integrations: false, sso: false },
    isCustom: false,
    projectScoped: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'r3',
    name: 'Coordinator',
    permissions: { access: true, projectActions: true, adminActions: false, dataExport: false, integrations: false, sso: false },
    isCustom: false,
    projectScoped: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const MOCK_PROJECTS = [
  { id: 'p1', name: 'Riverside Villa', branding: undefined, templates: [], storageQuota: 1024, currentStorageUsed: 256, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2025-02-23T00:00:00Z' },
  { id: 'p2', name: 'Urban Loft', branding: undefined, templates: [], storageQuota: 512, currentStorageUsed: 128, createdAt: '2024-02-01T00:00:00Z', updatedAt: '2025-02-23T00:00:00Z' },
]

const MOCK_INVITES = [
  { id: 'i1', email: 'client@example.com', roleId: 'r3', projectsScoped: ['p1'], message: 'Welcome!', status: 'pending' as const, sentAt: '2025-02-22T12:00:00Z', expiresAt: '2025-03-01T12:00:00Z', invitedBy: '1', createdAt: '2025-02-22T12:00:00Z', updatedAt: '2025-02-22T12:00:00Z' },
]

const MOCK_ACTIVITY = [
  { id: 'a1', userId: '1', action: 'invite_sent', targetId: 'i1', timestamp: '2025-02-22T12:00:00Z', details: { email: 'client@example.com' } },
  { id: 'a2', userId: '2', action: 'role_updated', targetId: '2', timestamp: '2025-02-21T14:00:00Z', details: { role: 'Project Lead' } },
  { id: 'a3', userId: '1', action: 'member_added', targetId: '3', timestamp: '2025-02-20T09:00:00Z', details: { name: 'Alice Brown' } },
]

const MOCK_SSO = { id: 's1', enabled: false, lastConfiguredAt: undefined }

function getMockTeams(): TeamsResponse {
  return {
    users: MOCK_USERS,
    invites: MOCK_INVITES,
    roles: MOCK_ROLES,
    projects: MOCK_PROJECTS,
  }
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      try {
        return await teamApi.getTeams()
      } catch {
        return getMockTeams()
      }
    },
  })
}

export function useInvites() {
  return useQuery({
    queryKey: ['teams', 'invites'],
    queryFn: async () => {
      try {
        return await teamApi.getInvites()
      } catch {
        return MOCK_INVITES
      }
    },
  })
}

export function useInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateInviteInput) => teamApi.invite(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['teams', 'invites'] })
    },
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRoleInput) => teamApi.createRole(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, input }: { roleId: string; input: UpdateRoleInput }) =>
      teamApi.updateRole(roleId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useRemoveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => teamApi.removeUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useAssignRoles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: AssignRolesInput[] }) =>
      teamApi.assignRoles(userId, roles),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useActivity() {
  return useQuery({
    queryKey: ['activity'],
    queryFn: async () => {
      try {
        return await teamApi.getActivity()
      } catch {
        return MOCK_ACTIVITY
      }
    },
  })
}

export function useSSOConfig() {
  return useQuery({
    queryKey: ['enterprise', 'sso'],
    queryFn: async () => {
      try {
        return await teamApi.getSSOConfig()
      } catch {
        return MOCK_SSO
      }
    },
  })
}
