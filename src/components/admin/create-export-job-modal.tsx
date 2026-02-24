/**
 * Create Export Job Modal - workspace data export with scope selection.
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
import { FileArchive, Loader2 } from 'lucide-react'
import { useAdminWorkspaces } from '@/hooks/use-admin'

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

  const { data: workspaces = [] } = useAdminWorkspaces()

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
            <Select value={workspaceId} onValueChange={setWorkspaceId}>
              <SelectTrigger id="export-workspace" className="rounded-lg bg-input">
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
          </div>
          <div className="space-y-2">
            <Label>Scope</Label>
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
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
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!workspaceId || isLoading}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileArchive className="mr-2 h-4 w-4" />
            )}
            Create export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
