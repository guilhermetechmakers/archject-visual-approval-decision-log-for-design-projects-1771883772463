/**
 * Dashboard API - stubs ready for backend integration.
 * Falls back to mock data when API is unavailable.
 */

import { api } from '@/lib/api'
import type {
  DashboardPayload,
  DashboardProject,
  AwaitingApproval,
  RecentActivity,
} from '@/types/dashboard'

const USE_MOCK = !import.meta.env.VITE_API_URL

const MOCK_PROJECTS: DashboardProject[] = [
  {
    id: 'p1',
    name: 'Riverside Villa',
    progress: 65,
    last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    active_decisions_count: 3,
    branding: null,
  },
  {
    id: 'p2',
    name: 'Urban Loft',
    progress: 40,
    last_activity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    active_decisions_count: 2,
    branding: null,
  },
  {
    id: 'p3',
    name: 'Coastal Retreat',
    progress: 90,
    last_activity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    active_decisions_count: 1,
    branding: null,
  },
]

const MOCK_APPROVALS: AwaitingApproval[] = [
  {
    decision_id: '1',
    title: 'Kitchen finish options',
    project_id: 'p1',
    project_name: 'Riverside Villa',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    client_email: 'client@example.com',
    share_link: 'https://archject.app/portal/abc123',
    status: 'pending',
  },
  {
    decision_id: '2',
    title: 'Bathroom tile selection',
    project_id: 'p1',
    project_name: 'Riverside Villa',
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    client_email: 'client@example.com',
    share_link: 'https://archject.app/portal/def456',
    status: 'overdue',
  },
  {
    decision_id: '3',
    title: 'Exterior color palette',
    project_id: 'p2',
    project_name: 'Urban Loft',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    client_email: 'client@urban.com',
    share_link: null,
    status: 'pending',
  },
]

const MOCK_ACTIVITY: RecentActivity[] = [
  {
    id: 'a1',
    type: 'approval',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    summary: 'Client approved Kitchen finish options',
    actor: 'Jane Smith',
    project_id: 'p1',
    decision_id: '1',
  },
  {
    id: 'a2',
    type: 'decision_created',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    summary: 'New decision created: Bathroom tile selection',
    actor: 'John Doe',
    project_id: 'p1',
    decision_id: '2',
  },
  {
    id: 'a3',
    type: 'link_shared',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    summary: 'Share link sent for Exterior color palette',
    actor: 'Jane Smith',
    project_id: 'p2',
    decision_id: '3',
  },
  {
    id: 'a4',
    type: 'comment',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    summary: 'Client left a comment on Floor plan revision',
    actor: 'Client',
    project_id: 'p1',
  },
]

function getMockDashboard(_workspaceId?: string | null): DashboardPayload {
  return {
    user: { id: 'user_1', name: 'Jane Smith', avatar: null },
    workspace: { id: 'ws_1', name: 'Studio Archject', branding: null },
    projects: MOCK_PROJECTS,
    awaiting_approvals: MOCK_APPROVALS,
    recent_activity: MOCK_ACTIVITY,
    usage: {
      projects_count: 12,
      decisions_count: 47,
      files_count: 128,
      storage_used: 2.4 * 1024,
      storage_quota: 10 * 1024,
    },
  }
}

export async function fetchDashboard(workspaceId?: string | null): Promise<DashboardPayload> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return getMockDashboard(workspaceId)
  }
  try {
    const params = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ''
    return await api.get<DashboardPayload>(`/dashboard${params}`)
  } catch {
    return getMockDashboard(workspaceId)
  }
}

export async function fetchWorkspaces(): Promise<{ id: string; name: string }[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    return [
      { id: 'ws_1', name: 'Studio Archject' },
      { id: 'ws_2', name: 'Urban Design Co' },
    ]
  }
  try {
    return await api.get<{ id: string; name: string }[]>('/workspaces')
  } catch {
    return [{ id: 'ws_1', name: 'Studio Archject' }]
  }
}

export async function generateShareLink(decisionId: string): Promise<{ link: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return { link: `https://archject.app/portal/${decisionId}-${Date.now().toString(36)}` }
  }
  return api.post<{ link: string }>('/share/link', { decisionId })
}
