/**
 * Retention Policy Modal - set data retention for workspace.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface RetentionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceName: string
  workspaceId: string
  onConfirm: (policy: { duration_days: number; scope: string }) => void
  isLoading?: boolean
}

const SCOPE_OPTIONS = [
  { value: 'audit_logs', label: 'Audit logs' },
  { value: 'user_data', label: 'User data' },
  { value: 'decisions', label: 'Decisions' },
  { value: 'all', label: 'All data' },
]

export function RetentionModal({
  open,
  onOpenChange,
  workspaceName,
  workspaceId,
  onConfirm,
  isLoading = false,
}: RetentionModalProps) {
  const [scope, setScope] = React.useState('audit_logs')
  const [durationDays, setDurationDays] = React.useState('365')

  const handleConfirm = () => {
    const days = parseInt(durationDays, 10)
    if (isNaN(days) || days < 1) return
    onConfirm({ scope, duration_days: days })
    onOpenChange(false)
    setScope('audit_logs')
    setDurationDays('365')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setScope('audit_logs')
      setDurationDays('365')
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Retention Policy</DialogTitle>
          <DialogDescription>
            Configure data retention for <strong>{workspaceName}</strong>. This will
            determine how long data is retained before automatic deletion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4" data-workspace-id={workspaceId}>
          <div className="space-y-2">
            <Label htmlFor="retention-scope">Scope</Label>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger id="retention-scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCOPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="retention-days">Retention (days)</Label>
            <Input
              id="retention-days"
              type="number"
              min={1}
              max={3650}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Applying...' : 'Apply Retention'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
