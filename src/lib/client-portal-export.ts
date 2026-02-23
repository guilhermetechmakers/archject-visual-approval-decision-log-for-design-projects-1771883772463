/**
 * Client Portal export - PDF and JSON for no-login decision view
 */

import type { NoLoginViewPayload } from '@/types/client-portal'
import { exportDecisionAsPDF, type ExportPayload } from './export-decision'

function toExportPayload(data: NoLoginViewPayload): ExportPayload {
  return {
    decision: {
      id: data.decision.id,
      title: data.decision.title,
      status: 'pending',
      description: null,
      due_date: null,
      created_at: data.decision.createdAt,
      updated_at: data.decision.updatedAt,
    },
    options: data.options.map((o) => ({
      id: o.id,
      decisionId: data.decision.id,
      title: o.title,
      description: o.description,
      cost: null,
      leadTime: null,
      dependencies: [],
      isRecommended: false,
      order: 0,
      attachments: o.mediaAssets.map((m) => ({
        id: m.id,
        type: 'image' as const,
        url: m.url,
        version: 1,
        uploadedAt: '',
        uploadedBy: null,
      })),
      mediaPreviewIds: o.mediaAssets.map((m) => m.id),
    })),
    comments: data.comments.map((c) => ({
      id: c.id,
      decisionId: data.decision.id,
      parentCommentId: c.threadId ?? null,
      authorId: c.authorId,
      authorName: c.authorName,
      authorAvatarUrl: null,
      content: c.text,
      createdAt: c.createdAt,
      mentions: c.mentions,
    })),
    approvals: (data.approvals ?? []).map((a) => ({
      id: a.id,
      decisionId: data.decision.id,
      actorId: '',
      actorName: a.clientName,
      role: 'client',
      action: a.approved ? ('approved' as const) : ('rejected' as const),
      timestamp: a.timestamp,
      ipAddress: null,
      clientInfo: null,
    })),
    files: [],
  }
}

export function exportClientPortalAsPDF(data: NoLoginViewPayload): void {
  exportDecisionAsPDF(toExportPayload(data))
}

export function exportClientPortalAsJSON(data: NoLoginViewPayload): string {
  const payload = toExportPayload(data)
  const extended = {
    ...payload,
    annotations: data.annotations,
    exportedAt: new Date().toISOString(),
  }
  return JSON.stringify(extended, null, 2)
}
