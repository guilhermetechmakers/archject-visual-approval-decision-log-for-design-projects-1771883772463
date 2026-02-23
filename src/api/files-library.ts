/**
 * Files & Drawings Library API - RESTful endpoints for file management
 */

import { api } from '@/lib/api'
import type { LibraryFile, FileVersion, DecisionAttachment, FileFilters } from '@/types/files-library'
import type { Decision } from '@/types/workspace'

export interface FilesListResponse {
  files: LibraryFile[]
  total: number
  page: number
  limit: number
}

export interface FileDetailResponse {
  file: LibraryFile
  versions: FileVersion[]
  linkedDecisions: DecisionAttachment[]
}

export async function fetchProjectFiles(
  projectId: string,
  params?: FileFilters & { page?: number; limit?: number }
): Promise<FilesListResponse> {
  const searchParams = new URLSearchParams()
  if (params?.type?.length) searchParams.set('type', params.type.join(','))
  if (params?.dateFrom) searchParams.set('date_from', params.dateFrom)
  if (params?.dateTo) searchParams.set('date_to', params.dateTo)
  if (params?.linkedDecision !== undefined) searchParams.set('linked', String(params.linkedDecision))
  if (params?.search) searchParams.set('q', params.search)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))
  const qs = searchParams.toString()
  return api.get<FilesListResponse>(`/projects/${projectId}/files${qs ? `?${qs}` : ''}`)
}

export async function fetchFileDetail(
  projectId: string,
  fileId: string
): Promise<FileDetailResponse> {
  return api.get<FileDetailResponse>(`/projects/${projectId}/files/${fileId}`)
}

export async function uploadFiles(
  projectId: string,
  formData: FormData
): Promise<{ files: LibraryFile[] }> {
  const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
  const response = await fetch(`${API_BASE}/projects/${projectId}/files`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message ?? response.statusText)
  }
  return response.json()
}

export async function createFileVersion(
  projectId: string,
  fileId: string,
  formData: FormData,
  notes: string
): Promise<FileVersion> {
  const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
  formData.append('notes', notes)
  const response = await fetch(
    `${API_BASE}/projects/${projectId}/files/${fileId}/versions`,
    {
      method: 'POST',
      body: formData,
    }
  )
  if (!response.ok) throw new Error(response.statusText)
  return response.json()
}

export async function revertToVersion(
  projectId: string,
  fileId: string,
  versionId: string
): Promise<LibraryFile> {
  return api.post<LibraryFile>(
    `/projects/${projectId}/files/${fileId}/revert`,
    { versionId }
  )
}

export async function linkFileToDecision(
  projectId: string,
  fileId: string,
  data: {
    decisionId: string
    attachmentType?: 'primary' | 'reference'
    optionId?: string
  }
): Promise<DecisionAttachment> {
  return api.post<DecisionAttachment>(
    `/projects/${projectId}/files/${fileId}/link-decision`,
    data
  )
}

export async function unlinkFileFromDecision(
  projectId: string,
  fileId: string,
  decisionId: string
): Promise<void> {
  return api.post(
    `/projects/${projectId}/files/${fileId}/unlink-decision`,
    { decisionId }
  )
}

export async function fetchProjectDecisions(
  projectId: string
): Promise<Decision[]> {
  return api.get<Decision[]>(`/projects/${projectId}/decisions`)
}

export async function fetchDecisionAttachments(
  projectId: string,
  decisionId: string
): Promise<DecisionAttachment[]> {
  return api.get<DecisionAttachment[]>(
    `/projects/${projectId}/decisions/${decisionId}/attachments`
  )
}

export async function fetchProjectWorkspace(
  projectId: string
): Promise<{
  project: unknown
  files: LibraryFile[]
  decisions: Decision[]
  team: unknown[]
  templates: unknown[]
}> {
  return api.get(`/projects/${projectId}/workspace`)
}

export async function exportFileBundle(
  projectId: string,
  fileId: string
): Promise<Blob> {
  const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
  const response = await fetch(
    `${API_BASE}/projects/${projectId}/files/${fileId}/export`,
    { method: 'POST' }
  )
  if (!response.ok) throw new Error(response.statusText)
  return response.blob()
}
