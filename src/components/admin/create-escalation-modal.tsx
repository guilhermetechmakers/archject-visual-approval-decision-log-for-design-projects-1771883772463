/**
 * Create Escalation Modal - quick-create escalation records.
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Inbox } from 'lucide-react'
import type { Escalation } from '@/types/admin'
import type { Workspace } from '@/types/admin'

interface CreateEscalationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaces: Workspace[]
  defaultWorkspaceId?: string
  defaultUserId?: string
  onConfirm: (data: {
    workspace_id: string
    user_id?: string
    reason: string
    priority: Escalation['priority']
    notes?: string
    assigned_team?: string
  }) => void
  isLoading?: boolean
  error?: string | null
}

const PRIORITIES: { value: Escalation['priority']; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const TEAMS = ['support-tier-1', 'support-tier-2', 'compliance', 'finance', 'engineering']

export function CreateEscalationModal({
  open,
  onOpenChange,
  workspaces,
  defaultWorkspaceId,
  defaultUserId,
  onConfirm,
  isLoading = false,
  error = null,
}: CreateEscalationModalProps) {
  const [workspaceId, setWorkspaceId] = React.useState(defaultWorkspaceId ?? '')
  const [userId, setUserId] = React.useState(defaultUserId ?? '')
  const [reason, setReason] = React.useState('')
  const [priority, setPriority] = React.useState<Escalation['priority']>('medium')
  const [notes, setNotes] = React.useState('')
  const [assignedTeam, setAssignedTeam] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setWorkspaceId(defaultWorkspaceId ?? workspaces[0]?.id ?? '')
      setUserId(defaultUserId ?? '')
      setReason('')
      setPriority('medium')
      setNotes('')
      setAssignedTeam('')
    }
  }, [open, defaultWorkspaceId, defaultUserId, workspaces])

  const handleConfirm = () => {
    if (!workspaceId || !reason.trim()) return
    onConfirm({
      workspace_id: workspaceId,
      user_id: userId || undefined,
      reason: reason.trim(),
      priority,
      notes: notes.trim() || undefined,
      assigned_team: assignedTeam || undefined,
    })
    onOpenChange(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason('')
      setNotes('')
    }
    onOpenChange(next)
  }

  const hasWorkspaces = workspaces.length > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg shadow-card border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AlertCircle className="h-5 w-5 text-primary" aria-hidden />
            Create Escalation
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create an escalation record for a workspace. This will be tracked in the support queue and
            audit log.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="escalation-workspace">Workspace</Label>
            <Select value={workspaceId} onValueChange={setWorkspaceId} disabled={!hasWorkspaces}>
              <SelectTrigger id="escalation-workspace" aria-describedby={!hasWorkspaces ? 'workspace-empty-desc' : undefined}>
                <SelectValue placeholder={hasWorkspaces ? 'Select workspace' : 'No workspaces available'} />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} ({w.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!hasWorkspaces && (
              <div
                id="workspace-empty-desc"
                className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 px-4 py-6 text-center"
              >
                <Inbox className="h-10 w-10 text-muted-foreground" aria-hidden />
                <p className="text-sm font-medium text-foreground">No workspaces available</p>
                <p className="text-sm text-muted-foreground">
                  Add a workspace first to create an escalation.
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (required)</Label>
            <Input
              id="reason"
              placeholder="e.g. Billing dispute, data export request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              aria-required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="escalation-priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Escalation['priority'])} disabled={isLoading}>
                <SelectTrigger id="escalation-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="escalation-team">Assigned Team</Label>
              <Select value={assignedTeam} onValueChange={setAssignedTeam} disabled={isLoading}>
                <SelectTrigger id="escalation-team">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isLoading}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="min-h-[44px] min-w-[44px] sm:min-w-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || !workspaceId || isLoading}
            className="min-h-[44px] min-w-[44px] sm:min-w-0"
          >
            {isLoading ? 'Creating...' : 'Create Escalation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
