/**
 * Dashboard API - stubs ready for backend integration.
 * Uses Supabase when configured, falls back to REST API or mock data.
 */

import { api } from '@/lib/api'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
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

async function fetchDashboardFromSupabase(
  workspaceId?: string | null
): Promise<DashboardPayload | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const profileRes = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  const profileData = profileRes.data as { full_name?: string; avatar_url?: string } | null

  const { data: userWorkspaces } = await supabase
    .from('user_workspace_links')
    .select('workspace_id')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const workspaceIds = ((userWorkspaces ?? []) as { workspace_id: string }[]).map((w) => w.workspace_id)
  if (workspaceIds.length === 0) {
    return {
      user: {
        id: user.id,
        name: profileData?.full_name ?? user.email ?? 'User',
        avatar: profileData?.avatar_url ?? null,
      },
      workspace: { id: '', name: 'No workspace', branding: null },
      projects: [],
      awaiting_approvals: [],
      recent_activity: [],
      usage: {
        projects_count: 0,
        decisions_count: 0,
        files_count: 0,
        storage_used: 0,
        storage_quota: 10 * 1024,
      },
    }
  }

  const effectiveWorkspaceId = workspaceId ?? workspaceIds[0]
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('id', effectiveWorkspaceId)
    .single()

  const { data: projectsData } = await supabase
    .from('projects')
    .select('id, name, usage, updated_at')
    .eq('workspace_id', effectiveWorkspaceId)
    .is('archived_at', null)
    .order('updated_at', { ascending: false })

  type ProjectRow = { id: string; name: string; usage?: unknown; updated_at: string }
  const projectsList = (projectsData ?? []) as ProjectRow[]
  const projectIds = projectsList.map((p) => p.id)
  const projectMap = new Map(projectsList.map((p) => [p.id, p]))

  type DecisionRow = { id: string; project_id: string; title: string; due_date: string | null }
  let decisionsData: DecisionRow[] = []
  if (projectIds.length > 0) {
    const { data: dec } = await supabase
      .from('decisions')
      .select('id, project_id, title, due_date')
      .in('project_id', projectIds)
      .eq('status', 'pending')
      .order('due_date', { ascending: true, nullsFirst: false })
    decisionsData = (dec ?? []) as DecisionRow[]
  }

  const projects: DashboardProject[] = projectsList.map((p) => {
    const usage = (p.usage as { storage_bytes?: number; decision_count?: number }) ?? {}
    const quota = { storage_bytes: 1073741824 }
    const used = usage.storage_bytes ?? 0
    const total = quota.storage_bytes ?? 1073741824
    const progress = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
    const pendingCount = decisionsData.filter((d) => d.project_id === p.id).length
    return {
      id: p.id,
      name: p.name,
      progress,
      last_activity: p.updated_at,
      active_decisions_count: pendingCount,
      branding: null,
    }
  })

  const awaiting_approvals: AwaitingApproval[] = decisionsData.slice(0, 10).map((d) => {
    const proj = projectMap.get(d.project_id)
    const base = `${typeof window !== 'undefined' ? window.location?.origin ?? '' : ''}/portal`
    return {
      decision_id: d.id,
      title: d.title,
      project_id: d.project_id,
      project_name: proj?.name ?? '',
      due_date: d.due_date ?? new Date().toISOString(),
      client_email: null,
      share_link: `${base}/${d.id}`,
      status: d.due_date && new Date(d.due_date) < new Date() ? 'overdue' : 'pending',
    }
  })

  const { data: auditData } = await supabase
    .from('audit_logs')
    .select('id, user_id, action, target_id, timestamp, details')
    .order('timestamp', { ascending: false })
    .limit(20)

  type AuditRow = { id: string; action: string; target_id: string; timestamp: string; details?: unknown }
  const recent_activity: RecentActivity[] = ((auditData ?? []) as AuditRow[]).map((a) => ({
    id: a.id,
    type: 'decision_created',
    timestamp: a.timestamp,
    summary: (a.details as { summary?: string })?.summary ?? a.action,
    actor: null,
    project_id: (a.details as { project_id?: string })?.project_id ?? null,
    decision_id: a.target_id,
  }))

  let storageUsed = 0
  let decisionsCount = 0
  for (const p of projectsList) {
    const u = (p.usage as { storage_bytes?: number; decision_count?: number }) ?? {}
    storageUsed += u.storage_bytes ?? 0
    decisionsCount += u.decision_count ?? 0
  }

  let filesCount = 0
  if (projectIds.length > 0) {
    const { count } = await supabase
      .from('project_files')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds)
    filesCount = count ?? 0
  }

  return {
    user: {
      id: user.id,
      name: profileData?.full_name ?? user.email ?? 'User',
      avatar: profileData?.avatar_url ?? null,
    },
    workspace: {
      id: (workspace as { id?: string } | null)?.id ?? effectiveWorkspaceId,
      name: ((workspace as { name?: string } | null)?.name) ?? 'Workspace',
      branding: null,
    },
    projects,
    awaiting_approvals,
    recent_activity,
    usage: {
      projects_count: projectsList.length,
      decisions_count: decisionsCount,
      files_count: filesCount,
      storage_used: storageUsed / (1024 * 1024),
      storage_quota: 10 * 1024,
    },
  }
}

export async function fetchDashboard(workspaceId?: string | null): Promise<DashboardPayload> {
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = await fetchDashboardFromSupabase(workspaceId)
      if (payload) return payload
    } catch {
      // Fall through to mock or API
    }
  }
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
  if (isSupabaseConfigured && supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return []

      const { data: links } = await supabase
        .from('user_workspace_links')
        .select('workspace_id')
        .eq('user_id', user.id)
        .eq('status', 'active')

      const workspaceIds = ((links ?? []) as { workspace_id: string }[]).map((l) => l.workspace_id)
      if (workspaceIds.length === 0) return []

      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('id, name')
        .in('id', workspaceIds)
        .order('name')

      return ((workspaces ?? []) as { id: string; name: string }[]).map((w) => ({
        id: w.id,
        name: w.name,
      }))
    } catch {
      // Fall through
    }
  }
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
