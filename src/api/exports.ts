/**
 * Decision Log Exports API
 * POST /exports/decision-log, GET /exports/{exportId}
 */

import { api } from '@/lib/api'

export type ExportFormat = 'PDF' | 'CSV' | 'JSON'

export interface CreateDecisionLogExportRequest {
  projectId: string
  decisionLogId?: string
  formats: ('PDF' | 'CSV' | 'JSON')[]
}

export interface CreateDecisionLogExportResponse {
  exportId: string
  status: 'pending' | 'processing'
}

export interface ExportStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  fileUrl?: string | null
  progress?: number
}

export async function createDecisionLogExport(
  payload: CreateDecisionLogExportRequest
): Promise<CreateDecisionLogExportResponse> {
  return api.post<CreateDecisionLogExportResponse>('/exports/decision-log', payload)
}

export async function getExportStatus(
  exportId: string
): Promise<ExportStatusResponse> {
  return api.get<ExportStatusResponse>(`/exports/${exportId}`)
}
