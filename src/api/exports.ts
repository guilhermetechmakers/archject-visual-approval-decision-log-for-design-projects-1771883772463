/**
 * Decision Log Exports API
 * Uses Supabase Edge Functions when configured, else REST API
 */

import { api } from '@/lib/api'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { getAccessTokenSync } from '@/lib/auth-service'

export type ExportFormat = 'PDF' | 'CSV' | 'JSON'

export interface CreateExportRequest {
  projectId: string
  scope?: 'project' | 'decision'
  decisionIds?: string[]
  format: ExportFormat
  brandingProfileId?: string
  includeSignatures?: boolean
  includeAttachments?: boolean
}

export interface CreateExportResponse {
  success?: boolean
  exportId: string
  status: 'queued' | 'processing' | 'completed'
  progress?: number
  artifactUrl?: string | null
  message?: string
}

export interface ExportStatusResponse {
  exportId?: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number
  artifactUrl?: string | null
  fileUrl?: string | null
  artifactSize?: number | null
  errorMessage?: string | null
  createdAt?: string
  completedAt?: string | null
  logs?: Array<{ message?: string; level?: string; timestamp?: string }>
}

export interface ExportDownloadResponse {
  downloadUrl: string
}

/** Legacy format for useDecisionLogExport */
export interface CreateDecisionLogExportRequest {
  projectId: string
  decisionLogId?: string
  formats: ('PDF' | 'CSV' | 'JSON')[]
}

export interface CreateDecisionLogExportResponse {
  exportId: string
  status: 'pending' | 'processing' | 'completed'
  progress?: number
  artifactUrl?: string | null
}

async function invokeSupabaseExport(
  name: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  if (!supabase) throw new Error('Supabase not configured')
  const token = getAccessTokenSync()
  const { data, error } = await supabase.functions.invoke(name, {
    body: body ?? {},
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (error) throw error
  if (data && typeof data === 'object' && 'message' in data && !('exportId' in data)) {
    throw new Error((data as { message?: string }).message ?? 'Export failed')
  }
  return data
}

export async function createExport(
  payload: CreateExportRequest
): Promise<CreateExportResponse> {
  if (isSupabaseConfigured && supabase) {
    const res = (await invokeSupabaseExport('exports-create', {
      projectId: payload.projectId,
      scope: payload.scope ?? 'project',
      decisionIds: payload.decisionIds ?? [],
      format: payload.format,
      brandingProfileId: payload.brandingProfileId ?? null,
      includeSignatures: payload.includeSignatures ?? false,
      includeAttachments: payload.includeAttachments ?? true,
    })) as CreateExportResponse
    return {
      exportId: res.exportId,
      status: res.status,
      progress: res.progress,
      artifactUrl: res.artifactUrl,
    }
  }
  const r = await api.post<CreateExportResponse>(
    `/projects/${payload.projectId}/exports`,
    {
      scope: payload.scope ?? 'project',
      decisionIds: payload.decisionIds ?? [],
      format: payload.format,
      brandingProfileId: payload.brandingProfileId,
      includeSignatures: payload.includeSignatures,
      includeAttachments: payload.includeAttachments,
    }
  )
  return r
}

export async function getExportStatus(
  exportId: string
): Promise<ExportStatusResponse> {
  if (isSupabaseConfigured && supabase) {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
    const url = `${baseUrl}/functions/v1/exports-get?exportId=${encodeURIComponent(exportId)}`
    const token = getAccessTokenSync()
    const resp = await fetch(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!resp.ok) throw new Error(await resp.text())
    const data = (await resp.json()) as ExportStatusResponse
    return {
      ...data,
      fileUrl: data.artifactUrl ?? data.fileUrl,
    }
  }
  const r = await api.get<ExportStatusResponse>(`/exports/${exportId}`)
  return { ...r, fileUrl: r.artifactUrl ?? r.fileUrl }
}

export async function getExportDownload(
  exportId: string
): Promise<ExportDownloadResponse> {
  if (isSupabaseConfigured && supabase) {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
    const url = `${baseUrl}/functions/v1/exports-download?exportId=${encodeURIComponent(exportId)}`
    const token = getAccessTokenSync()
    const resp = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!resp.ok) throw new Error(await resp.text())
    return resp.json() as Promise<ExportDownloadResponse>
  }
  const r = await api.get<ExportDownloadResponse>(`/exports/${exportId}/download`)
  return r
}

export async function retryExport(
  exportId: string
): Promise<{ exportId: string; status: string }> {
  if (isSupabaseConfigured && supabase) {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exports-retry`
    const token = getAccessTokenSync()
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ exportId }),
    })
    if (!resp.ok) throw new Error(await resp.text())
    return resp.json() as Promise<{ exportId: string; status: string }>
  }
  return api.post<{ exportId: string; status: string }>(
    `/exports/${exportId}/retry`,
    {}
  )
}

/** Legacy: create decision log export (single format) */
export async function createDecisionLogExport(
  payload: CreateDecisionLogExportRequest
): Promise<CreateDecisionLogExportResponse> {
  const format = payload.formats[0] ?? 'PDF'
  const res = await createExport({
    projectId: payload.projectId,
    scope: payload.decisionLogId ? 'decision' : 'project',
    decisionIds: payload.decisionLogId ? [payload.decisionLogId] : undefined,
    format,
  })
  return {
    exportId: res.exportId,
    status: res.status === 'completed' ? 'completed' : res.status === 'processing' ? 'processing' : 'pending',
    progress: res.progress,
    artifactUrl: res.artifactUrl,
  }
}
