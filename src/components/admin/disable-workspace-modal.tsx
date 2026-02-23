/**
 * Disable Workspace Modal - confirmation for destructive workspace disable.
 */

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
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
import { Input } from '@/components/ui/input'

interface DisableWorkspaceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceName: string
  workspaceId: string
  onConfirm: (reason: string) => void
  isLoading?: boolean
}

export function DisableWorkspaceModal({
  open,
  onOpenChange,
  workspaceName,
  workspaceId,
  onConfirm,
  isLoading = false,
}: DisableWorkspaceModalProps) {
  const [reason, setReason] = React.useState('')

  const handleConfirm = () => {
    if (!reason.trim()) return
    onConfirm(reason)
    onOpenChange(false)
    setReason('')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason('')
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Disable Workspace
          </DialogTitle>
          <DialogDescription>
            You are about to disable <strong>{workspaceName}</strong>. Users will lose
            access. This action will be recorded in the audit log. A reason is required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4" data-workspace-id={workspaceId}>
          <div className="space-y-2">
            <Label htmlFor="disable-reason">Reason (required)</Label>
            <Input
              id="disable-reason"
              placeholder="e.g. Terms violation, customer request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? 'Disabling...' : 'Disable Workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
