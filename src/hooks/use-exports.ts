/**
 * Decision Log Exports hooks
 * Supports PDF, CSV, JSON with API + client-side fallback
 */

import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createExport,
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
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

async function pollExportStatus(
  exportId: string,
  maxAttempts = 60
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await getExportStatus(exportId)
    if (res.status === 'completed' && (res.artifactUrl ?? res.fileUrl)) {
      return res.artifactUrl ?? res.fileUrl ?? ''
    }
    if (res.status === 'failed') {
      throw new Error(res.errorMessage ?? 'Export failed')
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Export timed out')
}

export interface UseDecisionLogExportOptions {
  projectId?: string
  decisionLogId?: string
  decisionIds?: string[]
  /** Client-side fallback payload when API is unavailable */
  clientPayload?: ExportPayload
}

export function useDecisionLogExport({
  projectId,
  decisionLogId,
  decisionIds,
  clientPayload,
}: UseDecisionLogExportOptions = {}) {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
    null
  )

  const downloadFromUrl = useCallback(async (url: string, filename: string) => {
    const res = await fetch(url)
    const blob = await res.blob()
    downloadBlob(blob, filename)
  }, [])

  const exportPdf = useCallback(async () => {
    setExportingFormat('PDF')
    try {
      if (projectId && (decisionLogId || decisionIds?.length)) {
        const { exportId, status, artifactUrl } = await createExport({
          projectId,
          scope: decisionIds?.length ? 'decision' : 'project',
          decisionIds: decisionIds ?? (decisionLogId ? [decisionLogId] : []),
          format: 'PDF',
        })
        if (status === 'completed' && artifactUrl) {
          await downloadFromUrl(
            artifactUrl,
            `decision-log-${decisionLogId ?? 'export'}.pdf`
          )
          toast.success('PDF exported')
        } else {
          const fileUrl = await pollExportStatus(exportId)
          await downloadFromUrl(
            fileUrl,
            `decision-log-${decisionLogId ?? 'export'}.pdf`
          )
          toast.success('PDF exported')
        }
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
  }, [projectId, decisionLogId, decisionIds, clientPayload, downloadFromUrl])

  const exportCsv = useCallback(async () => {
    setExportingFormat('CSV')
    try {
      if (projectId && (decisionLogId || decisionIds?.length)) {
        const { exportId, status, artifactUrl } = await createExport({
          projectId,
          scope: decisionIds?.length ? 'decision' : 'project',
          decisionIds: decisionIds ?? (decisionLogId ? [decisionLogId] : []),
          format: 'CSV',
        })
        if (status === 'completed' && artifactUrl) {
          await downloadFromUrl(
            artifactUrl,
            `decision-log-${decisionLogId ?? 'export'}.csv`
          )
          toast.success('CSV exported')
        } else {
          const fileUrl = await pollExportStatus(exportId)
          await downloadFromUrl(
            fileUrl,
            `decision-log-${decisionLogId ?? 'export'}.csv`
          )
          toast.success('CSV exported')
        }
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
  }, [projectId, decisionLogId, decisionIds, clientPayload, downloadFromUrl])

  const exportJson = useCallback(async () => {
    setExportingFormat('JSON')
    try {
      if (projectId && (decisionLogId || decisionIds?.length)) {
        const { exportId, status, artifactUrl } = await createExport({
          projectId,
          scope: decisionIds?.length ? 'decision' : 'project',
          decisionIds: decisionIds ?? (decisionLogId ? [decisionLogId] : []),
          format: 'JSON',
        })
        if (status === 'completed' && artifactUrl) {
          await downloadFromUrl(
            artifactUrl,
            `decision-log-${decisionLogId ?? 'export'}.json`
          )
          toast.success('JSON exported')
        } else {
          const fileUrl = await pollExportStatus(exportId)
          await downloadFromUrl(
            fileUrl,
            `decision-log-${decisionLogId ?? 'export'}.json`
          )
          toast.success('JSON exported')
        }
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
  }, [projectId, decisionLogId, decisionIds, clientPayload, downloadFromUrl])

  return {
    exportPdf,
    exportCsv,
    exportJson,
    isExporting: exportingFormat !== null,
    exportingFormat,
  }
}

export function useCreateExport(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (opts: {
      format: ExportFormat
      scope?: 'project' | 'decision'
      decisionIds?: string[]
    }) => {
      const res = await createExport({
        projectId,
        format: opts.format,
        scope: opts.scope ?? 'project',
        decisionIds: opts.decisionIds ?? [],
      })
      return { ...res, format: opts.format }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['exports', projectId] })
      toast.success(`Export started: ${result.format}`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to start export')
    },
  })
}

export function useExportStatus(exportId: string | null) {
  return useQuery({
    queryKey: ['export-status', exportId],
    queryFn: () => getExportStatus(exportId!),
    enabled: !!exportId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'completed' || status === 'failed') return false
      return 1500
    },
  })
}

export function useExportHistory(projectId: string | null) {
  return useQuery({
    queryKey: ['exports', projectId],
    queryFn: async () => {
      if (!projectId) return []
      if (!isSupabaseConfigured || !supabase) return []
      const { data } = await supabase
        .from('decision_exports')
        .select('id, format, status, progress, artifact_url, created_at, error_message')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20)
      return (data ?? []) as Array<{
        id: string
        format: string
        status: string
        progress: number
        artifact_url: string | null
        created_at: string
        error_message: string | null
      }>
    },
    enabled: !!projectId,
  })
}
