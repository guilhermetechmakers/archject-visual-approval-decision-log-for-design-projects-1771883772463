/**
 * Create Export Job Modal - scope, format, workspace selection.
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
import { Download, Loader2 } from 'lucide-react'
import { useCreateExportJob, useGovernanceWorkspaces } from '@/hooks/use-governance'

export interface CreateExportJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultWorkspaceId?: string
}

export function CreateExportJobModal({
  open,
  onOpenChange,
  defaultWorkspaceId,
}: CreateExportJobModalProps) {
  const [workspaceId, setWorkspaceId] = React.useState(defaultWorkspaceId ?? '')
  const [scope, setScope] = React.useState({ decisions: true, logs: true, files: false })
  const [format, setFormat] = React.useState<'zip' | 'tar'>('zip')

  const { data: workspaces } = useGovernanceWorkspaces()
  const createMutation = useCreateExportJob()

  React.useEffect(() => {
    if (open && defaultWorkspaceId) setWorkspaceId(defaultWorkspaceId)
    if (open && workspaces?.length && !workspaceId) setWorkspaceId(workspaces[0].id)
  }, [open, defaultWorkspaceId, workspaces, workspaceId])

  const handleConfirm = () => {
    if (!workspaceId) return
    createMutation.mutate({ workspace_id: workspaceId, scope, format })
    onOpenChange(false)
    setScope({ decisions: true, logs: true, files: false })
    setFormat('zip')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
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
            <Download className="h-5 w-5 text-primary" />
            Create Export Job
          </DialogTitle>
          <DialogDescription>
            Generate a data export for the selected workspace. Choose scope and format. Export activity is logged.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="export-workspace">Workspace</Label>
            <Select value={workspaceId} onValueChange={setWorkspaceId}>
              <SelectTrigger id="export-workspace" className="rounded-lg bg-input">
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces?.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data scope</Label>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-4 bg-muted/30">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={scope.decisions}
                  onCheckedChange={(c) => setScope((s) => ({ ...s, decisions: !!c }))}
                />
                <span className="text-sm">Decisions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={scope.logs}
                  onCheckedChange={(c) => setScope((s) => ({ ...s, logs: !!c }))}
                />
                <span className="text-sm">Audit logs</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={scope.files}
                  onCheckedChange={(c) => setScope((s) => ({ ...s, files: !!c }))}
                />
                <span className="text-sm">Files</span>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-format">Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as 'zip' | 'tar')}>
              <SelectTrigger id="export-format" className="rounded-lg bg-input">
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
            disabled={createMutation.isPending}
            aria-label="Cancel and close dialog"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!workspaceId || (!scope.decisions && !scope.logs && !scope.files) || createMutation.isPending}
            aria-label={createMutation.isPending ? 'Creating export job' : 'Create export job'}
          >
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {createMutation.isPending ? 'Creating…' : 'Create Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
