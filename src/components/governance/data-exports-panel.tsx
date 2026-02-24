/**
 * Data Exports Panel - ongoing/completed export jobs, status badges, actions.
 */

import * as React from 'react'
import { FileArchive, Download, RotateCw, Square, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useExportJobs, useAbortExportJob, useRetryExportJob } from '@/hooks/use-governance'
import { CreateExportJobModal } from './create-export-job-modal'
import type { DataExportJob } from '@/types/governance'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<DataExportJob['status'], { label: string; icon: React.ElementType; className: string }> = {
  queued: { label: 'Queued', icon: FileArchive, className: 'bg-warning/20 text-warning' },
  running: { label: 'Running', icon: Loader2, className: 'bg-primary/20 text-primary' },
  completed: { label: 'Completed', icon: CheckCircle, className: 'bg-success/20 text-success' },
  failed: { label: 'Failed', icon: XCircle, className: 'bg-destructive/20 text-destructive' },
}

function ExportJobRow({
  job,
  onAbort,
  onRetry,
}: {
  job: DataExportJob
  onAbort: (id: string) => void
  onRetry: (id: string) => void
}) {
  const config = STATUS_CONFIG[job.status]
  const Icon = config.icon

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-3 min-w-0">
        {job.status === 'running' ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
        ) : (
          <Icon className={cn('h-5 w-5 shrink-0', job.status === 'completed' && 'text-success', job.status === 'failed' && 'text-destructive')} />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {job.workspace_id} · {job.format.toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(job.created_at).toLocaleString()}
            {job.completed_at && ` · Completed ${new Date(job.completed_at).toLocaleString()}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={cn('rounded-full font-medium', config.className)}>
          {config.label}
        </Badge>
        {job.status === 'completed' && job.download_url && (
          <Button variant="outline" size="sm" asChild>
            <a href={job.download_url} download>
              <Download className="mr-1 h-4 w-4" />
              Download
            </a>
          </Button>
        )}
        {job.status === 'running' && (
          <Button variant="outline" size="sm" onClick={() => onAbort(job.id)}>
            <Square className="mr-1 h-4 w-4" />
            Abort
          </Button>
        )}
        {job.status === 'failed' && (
          <Button variant="outline" size="sm" onClick={() => onRetry(job.id)}>
            <RotateCw className="mr-1 h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}

export interface DataExportsPanelProps {
  workspaceId?: string
  className?: string
}

export function DataExportsPanel({ workspaceId, className }: DataExportsPanelProps) {
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const { data: jobs, isLoading } = useExportJobs(workspaceId)
  const abortMutation = useAbortExportJob()
  const retryMutation = useRetryExportJob()

  return (
    <>
      <Card className={cn('overflow-hidden rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover', className)}>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileArchive className="h-5 w-5 text-primary" />
            Data Exports
          </CardTitle>
          <Button size="sm" className="rounded-full" onClick={() => setCreateModalOpen(true)}>
            Create export
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : !jobs?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileArchive className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No export jobs yet</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setCreateModalOpen(true)}>
                Create first export
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <ExportJobRow
                  key={job.id}
                  job={job}
                  onAbort={(id) => abortMutation.mutate(id)}
                  onRetry={(id) => retryMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateExportJobModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        defaultWorkspaceId={workspaceId}
      />
    </>
  )
}
