/**
 * Workspaces API - CRUD, quotas, usage, branding
 */

import { api } from '@/lib/api'
import type { Workspace, Branding, WorkspaceQuota, WorkspaceUsage } from '@/types/workspace-management'

export interface CreateWorkspaceInput {
  name: string
  branding?: Partial<Branding>
  quotas?: WorkspaceQuota
}

export interface UpdateWorkspaceInput {
  name?: string
  branding?: Partial<Branding>
  quotas?: WorkspaceQuota
}

export async function fetchWorkspaces(): Promise<Workspace[]> {
  return api.get<Workspace[]>('/workspaces')
}

export async function fetchWorkspace(workspaceId: string): Promise<Workspace> {
  return api.get<Workspace>(`/workspaces/${workspaceId}`)
}

export async function createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
  return api.post<Workspace>('/workspaces', input)
}

export async function updateWorkspace(
  workspaceId: string,
  input: UpdateWorkspaceInput
): Promise<Workspace> {
  return api.patch<Workspace>(`/workspaces/${workspaceId}`, input)
}

export async function archiveWorkspace(workspaceId: string): Promise<Workspace> {
  return api.post<Workspace>(`/workspaces/${workspaceId}/archive`, {})
}

export async function restoreWorkspace(workspaceId: string): Promise<Workspace> {
  return api.post<Workspace>(`/workspaces/${workspaceId}/restore`, {})
}

export async function adjustWorkspaceQuotas(
  workspaceId: string,
  quotas: Partial<WorkspaceQuota>
): Promise<Workspace> {
  return api.post<Workspace>(`/workspaces/${workspaceId}/adjust-quotas`, quotas)
}

export async function fetchWorkspaceUsage(workspaceId: string): Promise<WorkspaceUsage> {
  return api.get<WorkspaceUsage>(`/workspaces/${workspaceId}/usage`)
}

export async function updateWorkspaceBranding(
  workspaceId: string,
  branding: Partial<Branding>
): Promise<Branding> {
  return api.post<Branding>(`/workspaces/${workspaceId}/branding`, branding)
}
