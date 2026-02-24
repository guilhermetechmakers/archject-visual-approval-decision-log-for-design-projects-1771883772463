/**
 * Projects API - workspace and project management
 * Uses Supabase when configured, falls back to REST API
 */

import { api } from '@/lib/api'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Project } from '@/types/workspace'

export interface CreateProjectPayload {
  workspace_id: string
  name: string
  client_info?: { name?: string; email?: string }
  branding?: { logo_url?: string | null; primary_color?: string | null }
  quota?: { storage_bytes?: number; decision_count?: number }
}

export interface CreateWorkspacePayload {
  name: string
  branding?: Record<string, unknown>
  quotas?: { storage_bytes?: number; decision_count?: number }
}

export interface ProjectListItem {
  id: string
  name: string
  workspace_id: string
  status: 'active' | 'archived' | 'on_hold'
  usage?: { storage_bytes?: number; decision_count?: number }
  quota?: { storage_bytes?: number; decision_count?: number }
  archived_at?: string | null
  created_at: string
}

function projectFromRow(row: {
  id: string
  name: string
  workspace_id: string
  status: string
  usage?: unknown
  quota?: unknown
  archived_at?: string | null
  created_at: string
  branding?: unknown
  client_info?: unknown
}): ProjectListItem {
  const usage = (row.usage as { storage_bytes?: number; decision_count?: number }) ?? {}
  const quota = (row.quota as { storage_bytes?: number; decision_count?: number }) ?? {}
  return {
    id: row.id,
    name: row.name,
    workspace_id: row.workspace_id,
    status: row.status as 'active' | 'archived' | 'on_hold',
    usage,
    quota,
    archived_at: row.archived_at,
    created_at: row.created_at,
  }
}

export async function fetchProjects(workspaceId?: string): Promise<ProjectListItem[]> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('projects')
      .select('id, name, workspace_id, status, usage, quota, archived_at, created_at')
      .is('archived_at', null)
      .order('created_at', { ascending: false })

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data ?? []).map(projectFromRow)
  }

  try {
    const params = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : ''
    const data = await api.get<ProjectListItem[]>(`/projects${params}`)
    return data ?? []
  } catch {
    return []
  }
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  if (isSupabaseConfigured && supabase) {
    const quota = payload.quota ?? { storage_bytes: 1073741824, decision_count: 100 }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('projects')
      .insert({
        workspace_id: payload.workspace_id,
        name: payload.name,
        client_info: payload.client_info ?? {},
        branding: payload.branding ?? {},
        quota,
        usage: { storage_bytes: 0, decision_count: 0 },
        status: 'active',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    const row = data as {
      id: string
      name: string
      workspace_id: string
      client_info: unknown
      branding: unknown
      quota: { storage_bytes?: number; decision_count?: number }
      usage: { storage_bytes?: number; decision_count?: number }
      status: string
      created_at: string
      updated_at: string
      archived_at: string | null
    }
    const q = row.quota ?? {}
    const u = row.usage ?? {}
    return {
      id: row.id,
      name: row.name,
      workspace_id: row.workspace_id,
      client_name: (row.client_info as { name?: string })?.name ?? null,
      branding_logo_url: (row.branding as { logo_url?: string })?.logo_url ?? null,
      branding_color: (row.branding as { primary_color?: string })?.primary_color ?? '#195C4A',
      storage_quota_bytes: q.storage_bytes ?? 1073741824,
      current_storage_bytes: u.storage_bytes ?? 0,
      status: row.status as 'active' | 'archived' | 'on_hold',
      created_at: row.created_at,
      updated_at: row.updated_at,
      archived: !!row.archived_at,
    } as Project
  }

  return api.post<Project>('/projects', payload)
}

export async function fetchProject(projectId: string): Promise<Project | null> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- projects table schema compatibility
    const { data, error } = await (supabase as any)
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error || !data) return null

    const row = data as {
      id: string
      name: string
      workspace_id: string
      client_info: unknown
      branding: unknown
      quota: { storage_bytes?: number; decision_count?: number }
      usage: { storage_bytes?: number; decision_count?: number }
      status: string
      created_at: string
      updated_at: string
      archived_at: string | null
    }
    const q = row.quota ?? {}
    const u = row.usage ?? {}
    return {
      id: row.id,
      name: row.name,
      workspace_id: row.workspace_id,
      client_name: (row.client_info as { name?: string })?.name ?? null,
      branding_logo_url: (row.branding as { logo_url?: string })?.logo_url ?? null,
      branding_color: (row.branding as { primary_color?: string })?.primary_color ?? '#195C4A',
      storage_quota_bytes: q.storage_bytes ?? 1073741824,
      current_storage_bytes: u.storage_bytes ?? 0,
      status: row.status as 'active' | 'archived' | 'on_hold',
      created_at: row.created_at,
      updated_at: row.updated_at,
      archived: !!row.archived_at,
    } as Project
  }

  try {
    return await api.get<Project>(`/projects/${projectId}`)
  } catch {
    return null
  }
}

export async function createWorkspace(payload: CreateWorkspacePayload): Promise<{ id: string; name: string }> {
  if (isSupabaseConfigured && supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- workspaces table schema compatibility
    const { data, error } = await (supabase as any)
      .from('workspaces')
      .insert({
        name: payload.name,
        owner_user_id: user.id,
        branding: payload.branding ?? null,
        quotas: payload.quotas ?? { storage_bytes: 5368709120, decision_count: 1000 },
        usage: { storage_bytes: 0, decision_count: 0 },
      })
      .select('id, name')
      .single()

    if (error) throw new Error(error.message)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- user_workspace_links table schema compatibility
    await (supabase as any).from('user_workspace_links').insert({
      user_id: user.id,
      workspace_id: data.id,
      role: 'owner',
      status: 'active',
    })

    return { id: data.id, name: data.name }
  }

  return api.post<{ id: string; name: string }>('/workspaces', payload)
}

export async function archiveProject(projectId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- projects table schema compatibility
    const { error } = await (supabase as any)
      .from('projects')
      .update({ status: 'archived', archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', projectId)
    if (error) throw new Error(error.message)
    return
  }
  return api.post(`/projects/${projectId}/archive`)
}

export async function restoreProject(projectId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- projects table schema compatibility
    const { error } = await (supabase as any)
      .from('projects')
      .update({ status: 'active', archived_at: null, updated_at: new Date().toISOString() })
      .eq('id', projectId)
    if (error) throw new Error(error.message)
    return
  }
  return api.post(`/projects/${projectId}/restore`)
}
