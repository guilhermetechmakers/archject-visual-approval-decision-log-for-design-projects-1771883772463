/**
 * Decision Log Exports hooks
 * Supports PDF, CSV, JSON with API + client-side fallback
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  createDecisionLogExport,
  getExportStatus,
  type ExportFormat,
} from '@/api/exports'
import {
  exportDecisionAsPDF,
  exportDecisionAsCSV,
  exportDecisionAsJSON,
  downloadBlob,
  type ExportPayload,
} from '@/lib/export-decision'

async function pollExportStatus(
  exportId: string,
  maxAttempts = 30
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await getExportStatus(exportId)
    if (res.status === 'completed' && res.fileUrl) return res.fileUrl
    if (res.status === 'failed') throw new Error('Export failed')
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Export timed out')
}

export interface UseDecisionLogExportOptions {
  projectId?: string
  decisionLogId?: string
  /** Client-side fallback payload when API is unavailable */
  clientPayload?: ExportPayload
}

export function useDecisionLogExport({
  projectId,
  decisionLogId,
  clientPayload,
}: UseDecisionLogExportOptions = {}) {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
    null
  )

  const exportPdf = useCallback(async () => {
    setExportingFormat('PDF')
    try {
      if (projectId && decisionLogId) {
        const { exportId } = await createDecisionLogExport({
          projectId,
          decisionLogId,
          formats: ['PDF'],
        })
        const fileUrl = await pollExportStatus(exportId)
        const a = document.createElement('a')
        a.href = fileUrl
        a.download = `decision-log-${decisionLogId}.pdf`
        a.click()
        toast.success('PDF exported')
      } else if (clientPayload) {
        exportDecisionAsPDF(clientPayload)
        toast.success('PDF exported')
      } else {
        toast.error('No data to export')
      }
    } catch {
      if (clientPayload) {
        exportDecisionAsPDF(clientPayload)
        toast.success('PDF exported')
      } else {
        toast.error('Export failed')
      }
    } finally {
      setExportingFormat(null)
    }
  }, [projectId, decisionLogId, clientPayload])

  const exportCsv = useCallback(async () => {
    setExportingFormat('CSV')
    try {
      if (projectId && decisionLogId) {
        const { exportId } = await createDecisionLogExport({
          projectId,
          decisionLogId,
          formats: ['CSV'],
        })
        const fileUrl = await pollExportStatus(exportId)
        const res = await fetch(fileUrl)
        const blob = await res.blob()
        downloadBlob(blob, `decision-log-${decisionLogId}.csv`)
        toast.success('CSV exported')
      } else if (clientPayload) {
        const csv = exportDecisionAsCSV(clientPayload)
        const blob = new Blob([csv], { type: 'text/csv' })
        downloadBlob(blob, `decision-log-${decisionLogId ?? 'export'}.csv`)
        toast.success('CSV exported')
      } else {
        toast.error('No data to export')
      }
    } catch {
      if (clientPayload) {
        const csv = exportDecisionAsCSV(clientPayload)
        const blob = new Blob([csv], { type: 'text/csv' })
        downloadBlob(blob, `decision-log-export.csv`)
        toast.success('CSV exported')
      } else {
        toast.error('Export failed')
      }
    } finally {
      setExportingFormat(null)
    }
  }, [projectId, decisionLogId, clientPayload])

  const exportJson = useCallback(async () => {
    setExportingFormat('JSON')
    try {
      if (projectId && decisionLogId) {
        const { exportId } = await createDecisionLogExport({
          projectId,
          decisionLogId,
          formats: ['JSON'],
        })
        const fileUrl = await pollExportStatus(exportId)
        const res = await fetch(fileUrl)
        const blob = await res.blob()
        downloadBlob(blob, `decision-log-${decisionLogId}.json`)
        toast.success('JSON exported')
      } else if (clientPayload) {
        const json = exportDecisionAsJSON(clientPayload)
        const blob = new Blob([json], { type: 'application/json' })
        downloadBlob(blob, `decision-log-${decisionLogId ?? 'export'}.json`)
        toast.success('JSON exported')
      } else {
        toast.error('No data to export')
      }
    } catch {
      if (clientPayload) {
        const json = exportDecisionAsJSON(clientPayload)
        const blob = new Blob([json], { type: 'application/json' })
        downloadBlob(blob, `decision-log-export.json`)
        toast.success('JSON exported')
      } else {
        toast.error('Export failed')
      }
    } finally {
      setExportingFormat(null)
    }
  }, [projectId, decisionLogId, clientPayload])

  return {
    exportPdf,
    exportCsv,
    exportJson,
    isExporting: exportingFormat !== null,
    exportingFormat,
  }
}
