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
import { AlertCircle } from 'lucide-react'
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Create Escalation
          </DialogTitle>
          <DialogDescription>
            Create an escalation record for a workspace. This will be tracked in the support queue and
            audit log.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Workspace</Label>
            <Select value={workspaceId} onValueChange={setWorkspaceId}>
              <SelectTrigger>
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
            <Label htmlFor="reason">Reason (required)</Label>
            <Input
              id="reason"
              placeholder="e.g. Billing dispute, data export request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Escalation['priority'])}>
                <SelectTrigger>
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
              <Label>Assigned Team</Label>
              <Select value={assignedTeam} onValueChange={setAssignedTeam}>
                <SelectTrigger>
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!reason.trim() || isLoading}>
            {isLoading ? 'Creating...' : 'Create Escalation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
