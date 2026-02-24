/**
 * Create Export Job Modal - workspace data export with scope selection.
 * Design: design tokens, empty states, loading/error states, accessible checkboxes.
 */

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileArchive, FolderOpen, Loader2, AlertCircle } from 'lucide-react'
import { useAdminWorkspaces } from '@/hooks/use-admin'
import { cn } from '@/lib/utils'

interface CreateExportJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    workspace_id: string
    scope: { decisions?: boolean; logs?: boolean; files?: boolean }
    format: 'zip' | 'tar'
  }) => void | Promise<void>
  isLoading?: boolean
}

function WorkspacesEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-8 px-4 text-center"
      role="status"
      aria-label="No workspaces available"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FolderOpen className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">
        No workspaces available
      </p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Create or join a workspace first to export data.
      </p>
    </div>
  )
}

export function CreateExportJobModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateExportJobModalProps) {
  const [workspaceId, setWorkspaceId] = React.useState('')
  const [scope, setScope] = React.useState({
    decisions: true,
    logs: true,
    files: false,
  })
  const [format, setFormat] = React.useState<'zip' | 'tar'>('zip')

  const {
    data: workspaces = [],
    isLoading: workspacesLoading,
    isError: workspacesError,
  } = useAdminWorkspaces()

  const isEmpty = workspaces.length === 0

  const handleSubmit = async () => {
    if (!workspaceId) return
    await onSubmit({ workspace_id: workspaceId, scope, format })
    onOpenChange(false)
    setWorkspaceId('')
    setScope({ decisions: true, logs: true, files: false })
    setFormat('zip')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setWorkspaceId('')
      setScope({ decisions: true, logs: true, files: false })
      setFormat('zip')
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5 text-primary" />
            Create export job
          </DialogTitle>
          <DialogDescription>
            Generate a downloadable archive of workspace data. Select workspace, scope, and format.
            Export activity is logged and access-controlled.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="export-workspace">Workspace</Label>
            {workspacesLoading ? (
              <div
                className="h-10 w-full animate-pulse rounded-lg bg-muted"
                aria-label="Loading workspaces"
              />
            ) : workspacesError ? (
              <div
                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                <span>Failed to load workspaces. Please try again.</span>
              </div>
            ) : isEmpty ? (
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <WorkspacesEmptyState />
              </div>
            ) : (
              <Select value={workspaceId} onValueChange={setWorkspaceId}>
                <SelectTrigger
                  id="export-workspace"
                  className="rounded-lg bg-input"
                >
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} ({w.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label id="scope-label">Scope</Label>
            <div
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-card"
              role="group"
              aria-labelledby="scope-label"
            >
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md px-2 transition-colors hover:bg-muted/50">
                <Checkbox
                  id="scope-decisions"
                  checked={scope.decisions}
                  onCheckedChange={(c) =>
                    setScope((s) => ({ ...s, decisions: !!c }))
                  }
                  aria-label="Include decisions in export"
                />
                <span className="text-sm text-foreground">Decisions</span>
              </label>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md px-2 transition-colors hover:bg-muted/50">
                <Checkbox
                  id="scope-logs"
                  checked={scope.logs}
                  onCheckedChange={(c) =>
                    setScope((s) => ({ ...s, logs: !!c }))
                  }
                  aria-label="Include audit logs in export"
                />
                <span className="text-sm text-foreground">Audit logs</span>
              </label>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md px-2 transition-colors hover:bg-muted/50">
                <Checkbox
                  id="scope-files"
                  checked={scope.files}
                  onCheckedChange={(c) =>
                    setScope((s) => ({ ...s, files: !!c }))
                  }
                  aria-label="Include files in export"
                />
                <span className="text-sm text-foreground">Files</span>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-format">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as 'zip' | 'tar')}>
              <SelectTrigger
                id="export-format"
                className="rounded-lg bg-input"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zip">ZIP</SelectItem>
                <SelectItem value="tar">TAR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!workspaceId || isLoading || isEmpty || workspacesLoading}
            className={cn(
              'transition-all duration-200',
              'hover:scale-[1.02] hover:shadow-card-hover',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <FileArchive className="mr-2 h-4 w-4" aria-hidden />
            )}
            Create export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
