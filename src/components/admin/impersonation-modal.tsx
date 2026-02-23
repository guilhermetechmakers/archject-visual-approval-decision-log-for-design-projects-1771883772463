/**
 * Impersonation Modal - confirmation, audit log, safeguards.
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
import { Input } from '@/components/ui/input'
import { AlertTriangle } from 'lucide-react'
interface ImpersonationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceName: string
  workspaceId: string
  onConfirm: () => void
  isLoading?: boolean
}

export function ImpersonationModal({
  open,
  onOpenChange,
  workspaceName,
  workspaceId,
  onConfirm,
  isLoading = false,
}: ImpersonationModalProps) {
  const [reason, setReason] = React.useState('')
  const [confirmed, setConfirmed] = React.useState(false)

  const handleConfirm = () => {
    if (!confirmed) return
    onConfirm()
    onOpenChange(false)
    setReason('')
    setConfirmed(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason('')
      setConfirmed(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Impersonate Workspace
          </DialogTitle>
          <DialogDescription>
            You are about to impersonate <strong>{workspaceName}</strong>. This action will be
            recorded in the audit log. Use only for legitimate support purposes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4" data-workspace-id={workspaceId}>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (required)</Label>
            <Input
              id="reason"
              placeholder="e.g. Customer support ticket #12345"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">
              I understand this action will be logged and I will exit impersonation when done.
            </span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || !confirmed || isLoading}
          >
            {isLoading ? 'Starting...' : 'Start Impersonation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
