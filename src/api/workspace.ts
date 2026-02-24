/**
 * Project Workspace API - delegates to decisions API when Supabase configured
 */

import { api } from '@/lib/api'
import {
  createDecision as createDecisionApi,
  updateDecision as updateDecisionApi,
} from '@/api/decisions'
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
  type?: string;
}): Promise<Template[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return api.get<Template[]>(`/templates${qs ? `?${qs}` : ''}`)
}

export async function applyTemplate(
  projectId: string,
  templateId: string
): Promise<Decision> {
  return api.post<Decision>(
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
}): Promise<ClientLink> {
  return api.post<ClientLink>('/client-links', data)
}

export async function revokeClientLink(linkId: string): Promise<void> {
  return api.delete(`/client-links/${linkId}`)
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

export async function createTask(
  projectId: string,
  data: Partial<Task>
): Promise<Task> {
  return api.post<Task>(`/projects/${projectId}/tasks`, data)
}

export async function createWebhook(
  projectId: string,
  data: Partial<Webhook>
): Promise<Webhook> {
  return api.post<Webhook>(`/projects/${projectId}/webhooks`, data)
}
