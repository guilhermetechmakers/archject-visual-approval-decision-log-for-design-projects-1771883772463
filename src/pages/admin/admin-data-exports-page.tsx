/**
 * Admin Data Exports - export jobs with status, download, retry, abort.
 */

import * as React from 'react'
import {
  Download,
  FileArchive,
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Square,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useExportJobs,
  useCreateExportJob,
  useAbortExportJob,
  useRetryExportJob,
} from '@/hooks/use-governance'
import { CreateExportJobModal } from '@/components/admin/create-export-job-modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  queued: 'bg-warning/20 text-warning',
  running: 'bg-primary/20 text-primary',
  completed: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function AdminDataExportsPage() {
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const { data: jobs, isLoading, error, refetch } = useExportJobs()
  const createMutation = useCreateExportJob()
  const abortMutation = useAbortExportJob()
  const retryMutation = useRetryExportJob()

  const handleCreate = async (data: {
    workspace_id: string
    scope: { decisions?: boolean; logs?: boolean; files?: boolean }
    format: 'zip' | 'tar'
  }) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success('Export job created')
      setCreateModalOpen(false)
    } catch {
      toast.error('Failed to create export job')
    }
  }

  const handleAbort = async (jobId: string) => {
    try {
      await abortMutation.mutateAsync(jobId)
      toast.success('Export job aborted')
    } catch {
      toast.error('Failed to abort export job')
    }
  }

  const handleRetry = async (jobId: string) => {
    try {
      await retryMutation.mutateAsync(jobId)
      toast.success('Export job retried')
    } catch {
      toast.error('Failed to retry export job')
    }
  }

  const items = jobs ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data exports</h1>
          <p className="mt-1 text-muted-foreground">
            Ongoing and completed export jobs for workspace data and decision logs
          </p>
        </div>
        <Button
          className="rounded-full transition-all duration-200 hover:scale-[1.02]"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create export job
        </Button>
      </div>

      <Card className="overflow-hidden rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileArchive className="h-5 w-5 text-primary" />
            Export jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileArchive className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Failed to load export jobs</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileArchive className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No export jobs yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setCreateModalOpen(true)}
              >
                Create first export
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((job: import('@/types/governance').DataExportJob) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {job.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : job.status === 'running' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : job.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <FileArchive className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        Workspace {job.workspace_id} · {job.format.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {formatTimestamp(job.created_at)}
                        {job.completed_at &&
                          ` · Completed ${formatTimestamp(job.completed_at)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(STATUS_COLORS[job.status] ?? 'bg-secondary')}>
                      {job.status}
                    </Badge>
                    {job.status === 'completed' && job.download_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={job.download_url} download>
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    )}
                    {(job.status === 'queued' || job.status === 'running') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAbort(job.id)}
                        disabled={abortMutation.isPending}
                        aria-label="Abort export"
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    )}
                    {job.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(job.id)}
                        disabled={retryMutation.isPending}
                      >
                        <RotateCcw className="mr-1 h-4 w-4" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateExportJobModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
