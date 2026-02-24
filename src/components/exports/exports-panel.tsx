/**
 * ExportsPanel - Export generation controls, status indicators, progress bars
 * Aligned with Archject design system
 */

import { useState } from 'react'
import {
  FileText,
  FileSpreadsheet,
  Braces,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useCreateExport, useExportHistory } from '@/hooks/use-exports'
import type { ExportFormat } from '@/api/exports'

export interface ExportsPanelProps {
  projectId: string
  decisionIds?: string[]
  onExportComplete?: (exportId: string, format: string) => void
  className?: string
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: typeof FileText }[] = [
  { value: 'PDF', label: 'PDF', icon: FileText },
  { value: 'CSV', label: 'CSV', icon: FileSpreadsheet },
  { value: 'JSON', label: 'JSON', icon: Braces },
]

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; icon: typeof CheckCircle2 }> = {
    completed: { className: 'bg-success/20 text-success', icon: CheckCircle2 },
    failed: { className: 'bg-destructive/20 text-destructive', icon: XCircle },
    processing: { className: 'bg-warning/20 text-warning-muted', icon: Loader2 },
    queued: { className: 'bg-muted text-muted-foreground', icon: Clock },
  }
  const { className, icon: Icon } = config[status] ?? config.queued
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className
      )}
    >
      {status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status !== 'processing' && <Icon className="h-3 w-3" />}
      {status}
    </span>
  )
}

export function ExportsPanel({
  projectId,
  decisionIds = [],
  onExportComplete,
  className,
}: ExportsPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('PDF')
  const createExport = useCreateExport(projectId)
  const { data: history = [], isLoading: historyLoading } = useExportHistory(projectId)

  const handleCreateExport = () => {
    createExport.mutate(
      {
        format: selectedFormat,
        scope: decisionIds.length ? 'decision' : 'project',
        decisionIds: decisionIds.length ? decisionIds : undefined,
      },
      {
        onSuccess: (data) => {
          const url = data.artifactUrl
          if (url && data.status === 'completed') {
            const a = document.createElement('a')
            a.href = url
            a.download = `decision-log-${data.exportId ?? 'export'}.${selectedFormat.toLowerCase()}`
            a.click()
            onExportComplete?.(data.exportId, selectedFormat)
          }
        },
      }
    )
  }

  const handleDownload = (url: string, format: string, exportId?: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `decision-log-${exportId ?? 'export'}.${format.toLowerCase()}`
    a.click()
  }

  return (
    <Card
      className={cn(
        'rounded-xl border border-border bg-card shadow-card transition-all duration-200',
        className
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Export Decision Log</CardTitle>
        <p className="text-sm text-muted-foreground">
          Export decisions, options, comments, approvals, and file references.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-foreground">Format</label>
            <Select
              value={selectedFormat}
              onValueChange={(v) => setSelectedFormat(v as ExportFormat)}
            >
              <SelectTrigger className="rounded-lg bg-input/50 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleCreateExport}
            disabled={createExport.isPending}
            className="rounded-full bg-primary px-6 text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          >
            {createExport.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Create Export
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Export History</h4>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No exports yet. Create your first export above.
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 5).map((exp) => (
                <div
                  key={exp.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {exp.format} export
                      </span>
                      <StatusBadge status={exp.status} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(exp.created_at).toLocaleString()}
                    </span>
                  </div>
                  {exp.status === 'processing' && (
                    <Progress value={exp.progress ?? 0} className="h-2" />
                  )}
                  {exp.status === 'completed' && exp.artifact_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit rounded-full"
                      onClick={() => handleDownload(exp.artifact_url!, exp.format, exp.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                  {exp.status === 'failed' && exp.error_message && (
                    <p className="text-xs text-destructive">{exp.error_message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
