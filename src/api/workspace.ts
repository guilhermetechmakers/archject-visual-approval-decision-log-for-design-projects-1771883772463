/**
 * Project Workspace API - delegates to decisions API when Supabase configured
 */

import { api } from '@/lib/api'
import {
  createDecision as createDecisionApi,
  updateDecision as updateDecisionApi,
} from '@/api/decisions'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { mockTasks, mockWebhooks, mockDecisions } from '@/lib/workspace-mock'
import type {
  Project,
  Decision,
  ProjectFile,
  TeamMember,
  Template,
  ActivityLog,
  ClientLink,
  Webhook,
  Task,
  ExportJob,
  SearchResult,
  SearchFilters,
} from '@/types/workspace'

const USE_MOCK = !isSupabaseConfigured && !import.meta.env.VITE_API_URL

export interface ProjectWorkspacePayload {
  project: Project
  decisions: Decision[]
  files: ProjectFile[]
  team: TeamMember[]
  templates: Template[]
  activity: ActivityLog[]
  client_links: ClientLink[]
}

export async function fetchProject(projectId: string): Promise<Project> {
  return api.get<Project>(`/projects/${projectId}`)
}

export async function updateProject(
  projectId: string,
  data: Partial<Pick<Project, 'name' | 'branding_logo_url' | 'branding_color' | 'domain_prefix' | 'status' | 'deadline' | 'project_type'>>
): Promise<Project> {
  return api.put<Project>(`/projects/${projectId}`, data)
}

export async function fetchProjectDecisions(
  projectId: string,
  params?: { status?: string; limit?: number; offset?: number }
): Promise<Decision[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return api.get<Decision[]>(`/projects/${projectId}/decisions${qs ? `?${qs}` : ''}`)
}

export async function fetchDecision(decisionId: string): Promise<Decision> {
  return api.get<Decision>(`/decisions/${decisionId}`)
}

export async function createDecision(
  projectId: string,
  data: Partial<Decision> & { metadata?: Record<string, unknown>; options?: unknown[] }
): Promise<Decision> {
  const metadata = { ...(data.metadata ?? {}) }
  const options = data.options ?? (metadata.options as unknown[])
  if (Array.isArray(options) && options.length > 0) {
    metadata.options = options
  }
  return createDecisionApi(projectId, {
    title: data.title ?? 'Untitled',
    status: data.status,
    due_date: data.due_date ?? undefined,
    assignee_id: data.assignee_id ?? undefined,
    summary: data.description ?? undefined,
    metadata: Object.keys(metadata).length ? metadata : undefined,
  })
}

export async function updateDecision(
  projectIdOrDecisionId: string,
  decisionIdOrData: string | Partial<Decision>,
  data?: Partial<Decision>
): Promise<Decision> {
  const projectId = data !== undefined ? projectIdOrDecisionId : ''
  const decisionId = data !== undefined ? (decisionIdOrData as string) : projectIdOrDecisionId
  const payload = (data ?? decisionIdOrData) as Partial<Decision>
  return updateDecisionApi(projectId, decisionId, {
    title: payload.title,
    status: payload.status,
    due_date: payload.due_date ?? undefined,
    assignee_id: payload.assignee_id ?? undefined,
    summary: payload.description ?? undefined,
  })
}

export async function fetchProjectFiles(
  projectId: string,
  params?: { file_type?: string; limit?: number; offset?: number }
): Promise<ProjectFile[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return api.get<ProjectFile[]>(`/projects/${projectId}/files${qs ? `?${qs}` : ''}`)
}

export async function uploadFile(
  projectId: string,
  formData: FormData
): Promise<ProjectFile> {
  const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
  const response = await fetch(`${API_BASE}/projects/${projectId}/files`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error(response.statusText)
  return response.json()
}

export async function fetchProjectTeam(projectId: string): Promise<TeamMember[]> {
  return api.get<TeamMember[]>(`/projects/${projectId}/team`)
}

export async function inviteTeamMember(
  projectId: string,
  data: { email: string; role: string; message?: string }
): Promise<TeamMember> {
  return api.post<TeamMember>(`/projects/${projectId}/team`, data)
}

export async function removeTeamMember(
  projectId: string,
  userId: string
): Promise<void> {
  return api.delete(`/projects/${projectId}/team/${userId}`)
}

export async function fetchTemplates(params?: {
  type?: string
  public?: boolean
  search?: string
}): Promise<Template[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return api.get<Template[]>(`/templates${qs ? `?${qs}` : ''}`)
}

export async function fetchTemplate(templateId: string): Promise<Template> {
  return api.get<Template>(`/templates/${templateId}`)
}

export interface ApplyTemplatePayload {
  title?: string
  description?: string
  metadata?: Record<string, unknown>
  options?: Array<{ title?: string; description?: string; order?: number }>
  approvalRules?: unknown[]
  assigneeId?: string | null
  dueDate?: string | null
}

export async function applyTemplate(
  projectId: string,
  templateId: string
): Promise<ApplyTemplatePayload> {
  return api.post<ApplyTemplatePayload>(
    `/projects/${projectId}/templates/${templateId}/apply`,
    {}
  )
}

export async function fetchProjectActivity(
  projectId: string,
  params?: { type?: string; limit?: number }
): Promise<ActivityLog[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return api.get<ActivityLog[]>(
    `/projects/${projectId}/activity${qs ? `?${qs}` : ''}`
  )
}

export async function createClientLink(data: {
  project_id: string
  decision_id?: string
  expires_at?: string
  otp_required?: boolean
  max_usage?: number | null
}): Promise<ClientLink> {
  return api.post<ClientLink>('/client-links', data)
}

export async function revokeClientLink(linkId: string): Promise<void> {
  return api.delete(`/client-links/${linkId}`)
}

export async function reissueClientLink(linkId: string): Promise<ClientLink> {
  return api.post<ClientLink>(`/client-links/${linkId}/reissue`, {})
}

export async function extendClientLink(
  linkId: string,
  expiresAt: string
): Promise<ClientLink> {
  return api.patch<ClientLink>(`/client-links/${linkId}`, { expires_at: expiresAt })
}

export async function fetchProjectClientLinks(
  projectId: string
): Promise<ClientLink[]> {
  return api.get<ClientLink[]>(`/projects/${projectId}/client-links`)
}

export async function createExport(
  projectId: string,
  type: 'pdf' | 'csv' | 'json'
): Promise<ExportJob> {
  return api.post<ExportJob>(`/projects/${projectId}/exports`, { type })
}

export async function fetchExportStatus(
  projectId: string,
  exportId: string
): Promise<ExportJob> {
  return api.get<ExportJob>(`/projects/${projectId}/exports/${exportId}`)
}

export async function search(
  query: string,
  filters?: SearchFilters
): Promise<SearchResult[]> {
  const body = { query, filters }
  return api.post<SearchResult[]>('/search', body)
}

export async function fetchProjectTasks(
  projectId: string,
  params?: { decisionId?: string; status?: string; limit?: number; offset?: number }
): Promise<Task[]> {
  if (USE_MOCK) {
    const normalized = ['1', 'p-1', 'proj-1'].includes(projectId) ? 'proj-1' : projectId
    return mockTasks
      .filter((t) => t.project_id === normalized || t.project_id === projectId)
      .map((t) => ({ ...t, project_id: projectId }))
  }
  if (isSupabaseConfigured && supabase) {
    const { data: decisions } = await (supabase as any)
      .from('decisions')
      .select('id')
      .eq('project_id', projectId)
    const decisionIds = ((decisions ?? []) as { id: string }[]).map((d) => d.id)
    if (decisionIds.length === 0) return []
    let query = (supabase as any)
      .from('tasks')
      .select('id, decision_id, assignee_id, due_date, status, priority, notes, created_at, updated_at')
      .in('decision_id', decisionIds)
    if (params?.decisionId) query = query.eq('decision_id', params.decisionId)
    if (params?.status) query = query.eq('status', params.status)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    const tasks = (data ?? []) as Array<{
      id: string
      decision_id: string
      assignee_id: string | null
      due_date: string | null
      status: string
      priority: string
      notes: string | null
      created_at: string
      updated_at: string
    }>
    const userIds = [...new Set(tasks.map((t) => t.assignee_id).filter(Boolean))]
    const profileMap = new Map<string, string>()
    if (userIds.length > 0) {
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)
      ;((profiles ?? []) as { id: string; full_name: string | null }[]).forEach((p) =>
        profileMap.set(p.id, p.full_name ?? 'Unknown')
      )
    }
    return tasks.map((t) => ({
      id: t.id,
      project_id: projectId,
      decision_id: t.decision_id,
      related_decision_id: t.decision_id,
      description: t.notes ?? '',
      status: t.status as Task['status'],
      priority: t.priority as Task['priority'],
      notes: t.notes,
      due_at: t.due_date,
      dueDate: t.due_date,
      assignee_id: t.assignee_id,
      assignee_name: t.assignee_id ? profileMap.get(t.assignee_id) ?? null : null,
      assigned_to: t.assignee_id,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }))
  }
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return api.get<Task[]>(`/projects/${projectId}/tasks${qs ? `?${qs}` : ''}`)
}

export async function createTask(
  projectId: string,
  data: Partial<Task> & { decision_id?: string; assignee_id?: string; due_date?: string; priority?: string; notes?: string; description?: string }
): Promise<Task> {
  if (USE_MOCK) {
    const decisionId =
      data.decision_id ??
      mockDecisions.find((d) => d.project_id === projectId || d.project_id === 'proj-1')?.id ??
      null
    const task: Task = {
      id: `task-${Date.now()}`,
      project_id: projectId,
      decision_id: decisionId,
      related_decision_id: decisionId,
      description: data.description ?? data.notes ?? 'Task',
      status: 'pending',
      priority: (data.priority as Task['priority']) ?? 'med',
      notes: data.notes ?? null,
      due_at: data.due_date ?? data.due_at ?? null,
      dueDate: data.due_date ?? data.due_at ?? null,
      assignee_id: data.assignee_id ?? null,
      assignee_name: null,
      assigned_to: data.assignee_id ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return task
  }
  if (isSupabaseConfigured && supabase && data.decision_id) {
    const { data: row, error } = await (supabase as any)
      .from('tasks')
      .insert({
        decision_id: data.decision_id,
        assignee_id: data.assignee_id ?? null,
        due_date: data.due_date ?? data.due_at ?? null,
        status: 'pending',
        priority: data.priority ?? 'med',
        notes: data.notes ?? null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return {
      id: row.id,
      project_id: projectId,
      decision_id: row.decision_id,
      related_decision_id: row.decision_id,
      description: row.notes ?? '',
      status: row.status,
      priority: row.priority,
      notes: row.notes,
      due_at: row.due_date,
      dueDate: row.due_date,
      assignee_id: row.assignee_id,
      assignee_name: null,
      assigned_to: row.assignee_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  }
  return api.post<Task>(`/projects/${projectId}/tasks`, data)
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<Pick<Task, 'status' | 'notes'>> & { assignee_id?: string; due_date?: string; priority?: string }
): Promise<Task> {
  if (USE_MOCK) {
    const tasks = mockTasks.filter((t) => t.project_id === projectId && t.id === taskId)
    if (tasks.length === 0) throw new Error('Task not found')
    const merged = { ...tasks[0], ...data }
    return {
      ...merged,
      priority: (merged.priority ?? 'med') as Task['priority'],
      status: (merged.status ?? 'pending') as Task['status'],
    }
  }
  if (isSupabaseConfigured && supabase) {
    const payload: Record<string, unknown> = {}
    if (data.status) payload.status = data.status
    if (data.notes !== undefined) payload.notes = data.notes
    if (data.assignee_id !== undefined) payload.assignee_id = data.assignee_id
    if (data.due_date !== undefined) payload.due_date = data.due_date
    if (data.priority !== undefined) payload.priority = data.priority
    const { data: row, error } = await (supabase as any)
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return {
      id: row.id,
      project_id: projectId,
      decision_id: row.decision_id,
      related_decision_id: row.decision_id,
      description: row.notes ?? '',
      status: (row.status ?? 'pending') as Task['status'],
      priority: (row.priority ?? 'med') as Task['priority'],
      notes: row.notes,
      due_at: row.due_date,
      dueDate: row.due_date,
      assignee_id: row.assignee_id,
      assignee_name: null,
      assigned_to: row.assignee_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  }
  return api.put<Task>(`/projects/${projectId}/tasks/${taskId}`, data)
}

export async function deleteTask(
  projectId: string,
  taskId: string
): Promise<void> {
  if (USE_MOCK) return
  if (isSupabaseConfigured && supabase) {
    const { error } = await (supabase as any).from('tasks').delete().eq('id', taskId)
    if (error) throw new Error(error.message)
    return
  }
  return api.delete(`/projects/${projectId}/tasks/${taskId}`)
}

export async function fetchProjectWebhooks(
  projectId: string,
  params?: { enabled?: boolean }
): Promise<Webhook[]> {
  if (USE_MOCK) {
    const normalized = ['1', 'p-1', 'proj-1'].includes(projectId) ? 'proj-1' : projectId
    return mockWebhooks
      .filter((w) => w.project_id === normalized || w.project_id === projectId)
      .map((w) => ({ ...w, project_id: projectId }))
  }
  if (isSupabaseConfigured && supabase) {
    let query = (supabase as any)
      .from('webhook_endpoints')
      .select('id, project_id, url, events, enabled, last_triggered_at, last_test_at, last_test_status, created_at, updated_at')
      .eq('project_id', projectId)
    if (params?.enabled !== undefined) query = query.eq('enabled', params.enabled)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map((w: { id: string; project_id: string; url: string; events: string[]; enabled: boolean; last_triggered_at: string | null; last_test_at: string | null; last_test_status: string | null }) => ({
      id: w.id,
      project_id: w.project_id,
      target_url: w.url,
      url: w.url,
      events: w.events ?? [],
      enabled: w.enabled,
      status: w.enabled ? 'active' : 'paused',
      last_trigger_at: w.last_triggered_at,
      lastTest: w.last_test_at,
    }))
  }
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return api.get<Webhook[]>(`/projects/${projectId}/webhooks${qs ? `?${qs}` : ''}`)
}

export async function createWebhook(
  projectId: string,
  data: Partial<Webhook> & { url: string; events?: string[]; signing_secret?: string }
): Promise<Webhook> {
  if (USE_MOCK) {
    return {
      id: `wh-${Date.now()}`,
      project_id: projectId,
      target_url: data.url,
      url: data.url,
      events: data.events ?? ['decision.created', 'decision.approved'],
      enabled: true,
      status: 'active',
      last_trigger_at: null,
      lastTest: null,
    }
  }
  if (isSupabaseConfigured && supabase) {
    const { data: row, error } = await (supabase as any)
      .from('webhook_endpoints')
      .insert({
        project_id: projectId,
        url: data.url,
        signing_secret: data.signing_secret ?? null,
        events: data.events ?? ['decision.created', 'decision.approved'],
        enabled: data.enabled ?? true,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return {
      id: row.id,
      project_id: row.project_id,
      target_url: row.url,
      url: row.url,
      events: row.events ?? [],
      enabled: row.enabled,
      status: row.enabled ? 'active' : 'paused',
      last_trigger_at: row.last_triggered_at,
      lastTest: row.last_test_at,
    }
  }
  return api.post<Webhook>(`/projects/${projectId}/webhooks`, data)
}

export async function updateWebhook(
  projectId: string,
  webhookId: string,
  data: Partial<Pick<Webhook, 'target_url' | 'url' | 'events' | 'status'>> & { enabled?: boolean }
): Promise<Webhook> {
  if (USE_MOCK) {
    const wh = mockWebhooks.find((w) => w.project_id === projectId && w.id === webhookId)
    if (!wh) throw new Error('Webhook not found')
    return { ...wh, ...data }
  }
  if (isSupabaseConfigured && supabase) {
    const payload: Record<string, unknown> = {}
    if (data.url !== undefined) payload.url = data.url
    if (data.target_url !== undefined) payload.url = data.target_url
    if (data.events !== undefined) payload.events = data.events
    if (data.enabled !== undefined) payload.enabled = data.enabled
    const { data: row, error } = await (supabase as any)
      .from('webhook_endpoints')
      .update(payload)
      .eq('id', webhookId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return {
      id: row.id,
      project_id: row.project_id,
      target_url: row.url,
      url: row.url,
      events: row.events ?? [],
      enabled: row.enabled,
      status: row.enabled ? 'active' : 'paused',
      last_trigger_at: row.last_triggered_at,
      lastTest: row.last_test_at,
    }
  }
  return api.put<Webhook>(`/projects/${projectId}/webhooks/${webhookId}`, data)
}

export async function deleteWebhook(
  projectId: string,
  webhookId: string
): Promise<void> {
  if (USE_MOCK) return
  if (isSupabaseConfigured && supabase) {
    const { error } = await (supabase as any).from('webhook_endpoints').delete().eq('id', webhookId)
    if (error) throw new Error(error.message)
    return
  }
  return api.delete(`/projects/${projectId}/webhooks/${webhookId}`)
}

export async function testWebhook(
  projectId: string,
  webhookId: string
): Promise<{ success: boolean; message?: string }> {
  if (USE_MOCK) {
    return { success: true, message: 'Test payload delivered (mock)' }
  }
  if (isSupabaseConfigured && supabase) {
    const { data: row } = await (supabase as any)
      .from('webhook_endpoints')
      .update({ last_test_at: new Date().toISOString(), last_test_status: 'success' })
      .eq('id', webhookId)
      .select()
      .single()
    if (row) return { success: true }
    return { success: false, message: 'Webhook not found' }
  }
  return api.post<{ success: boolean; message?: string }>(
    `/projects/${projectId}/webhooks/${webhookId}/test`,
    {}
  )
}
