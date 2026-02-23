/**
 * Export Workspace Modal - trigger data export with confirmation.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportWorkspaceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceName: string
  workspaceId: string
  onConfirm: () => void
  isLoading?: boolean
}

export function ExportWorkspaceModal({
  open,
  onOpenChange,
  workspaceName,
  workspaceId,
  onConfirm,
  isLoading = false,
}: ExportWorkspaceModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Force Data Export
          </DialogTitle>
          <DialogDescription>
            Trigger a full data export for <strong>{workspaceName}</strong>. The export will
            include all workspace data. You will receive a download link when the export is ready.
            This action is logged.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4" data-workspace-id={workspaceId} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Starting...' : 'Start Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
