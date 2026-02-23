/**
 * Workspace Actions Dropdown - Disable, Export, Retention, Create Escalation.
 */

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreHorizontal, Ban, Download, Shield, AlertCircle } from 'lucide-react'
import type { Workspace } from '@/types/admin'
import {
  useWorkspaceDisable,
  useWorkspaceExport,
  useWorkspaceRetention,
} from '@/hooks/use-admin'

interface WorkspaceActionsDropdownProps {
  workspace: Workspace
  onImpersonate?: () => void
  onCreateEscalation?: () => void
}

export function WorkspaceActionsDropdown({
  workspace,
  onImpersonate,
  onCreateEscalation,
}: WorkspaceActionsDropdownProps) {
  const [disableOpen, setDisableOpen] = React.useState(false)
  const [retentionOpen, setRetentionOpen] = React.useState(false)
  const [disableReason, setDisableReason] = React.useState('')

  const disableMutation = useWorkspaceDisable()
  const exportMutation = useWorkspaceExport()
  const retentionMutation = useWorkspaceRetention()

  const handleDisable = () => {
    if (!disableReason.trim()) return
    disableMutation.mutate(
      { workspaceId: workspace.id, reason: disableReason },
      {
        onSuccess: () => {
          setDisableOpen(false)
          setDisableReason('')
        },
      }
    )
  }

  const handleExport = () => {
    exportMutation.mutate(workspace.id)
  }

  const handleRetention = (durationDays: number, scope: string) => {
    retentionMutation.mutate(
      { workspaceId: workspace.id, policy: { duration_days: durationDays, scope } },
      {
        onSuccess: () => setRetentionOpen(false),
      }
    )
  }

  const isDisabled = workspace.status === 'disabled' || workspace.status === 'suspended'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8"
            aria-label="Workspace actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {onImpersonate && (
            <DropdownMenuItem onClick={onImpersonate}>
              <span className="mr-2">Impersonate</span>
            </DropdownMenuItem>
          )}
          {onCreateEscalation && (
            <DropdownMenuItem onClick={onCreateEscalation}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Create Escalation
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleExport} disabled={exportMutation.isPending}>
            <Download className="mr-2 h-4 w-4" />
            Force Data Export
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRetentionOpen(true)} disabled={retentionMutation.isPending}>
            <Shield className="mr-2 h-4 w-4" />
            Set Retention Policy
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDisableOpen(true)}
            disabled={isDisabled || disableMutation.isPending}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="mr-2 h-4 w-4" />
            Disable Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Disable confirmation */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Disable Workspace
            </DialogTitle>
            <DialogDescription>
              You are about to disable <strong>{workspace.name}</strong>. Users will not be able to
              access this workspace. This action will be logged. Provide a reason for audit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="disable-reason">Reason (required)</Label>
              <Input
                id="disable-reason"
                placeholder="e.g. Terms violation, customer request"
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisableOpen(false)} disabled={disableMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={!disableReason.trim() || disableMutation.isPending}
            >
              {disableMutation.isPending ? 'Disabling...' : 'Disable Workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Retention policy modal */}
      <RetentionPolicyModal
        open={retentionOpen}
        onOpenChange={setRetentionOpen}
        workspaceName={workspace.name}
        onConfirm={handleRetention}
        isLoading={retentionMutation.isPending}
      />
    </>
  )
}

interface RetentionPolicyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceName: string
  onConfirm: (durationDays: number, scope: string) => void
  isLoading?: boolean
}

function RetentionPolicyModal({
  open,
  onOpenChange,
  workspaceName,
  onConfirm,
  isLoading = false,
}: RetentionPolicyModalProps) {
  const [durationDays, setDurationDays] = React.useState(365)
  const [scope, setScope] = React.useState('user_data')

  const handleConfirm = () => {
    onConfirm(durationDays, scope)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Set Retention Policy
          </DialogTitle>
          <DialogDescription>
            Set data retention for <strong>{workspaceName}</strong>. Duration specifies how long data
            is retained before eligible for deletion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="retention-scope">Scope</Label>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger id="retention-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user_data">User Data</SelectItem>
                <SelectItem value="audit_logs">Audit Logs</SelectItem>
                <SelectItem value="all">All Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="retention-days">Duration (days)</Label>
            <Input
              id="retention-days"
              type="number"
              min={1}
              max={3650}
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 365)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Applying...' : 'Apply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
