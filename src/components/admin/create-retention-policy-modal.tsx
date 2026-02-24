/**
 * Create Retention Policy Modal - configure workspace retention.
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Archive, Loader2 } from 'lucide-react'
import { useAdminWorkspaces } from '@/hooks/use-admin'

interface CreateRetentionPolicyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    workspace_id: string
    policy_name: string
    mode: 'archive' | 'delete'
    duration_days: number
    legal_hold?: boolean
  }) => void | Promise<void>
  isLoading?: boolean
}

export function CreateRetentionPolicyModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateRetentionPolicyModalProps) {
  const [workspaceId, setWorkspaceId] = React.useState('')
  const [policyName, setPolicyName] = React.useState('')
  const [mode, setMode] = React.useState<'archive' | 'delete'>('archive')
  const [durationDays, setDurationDays] = React.useState(365)
  const [legalHold, setLegalHold] = React.useState(false)

  const { data: workspaces = [] } = useAdminWorkspaces()

  const handleSubmit = async () => {
    if (!workspaceId || !policyName.trim()) return
    await onSubmit({
      workspace_id: workspaceId,
      policy_name: policyName.trim(),
      mode,
      duration_days: legalHold ? 0 : durationDays,
      legal_hold: legalHold,
    })
    onOpenChange(false)
    setWorkspaceId('')
    setPolicyName('')
    setMode('archive')
    setDurationDays(365)
    setLegalHold(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setWorkspaceId('')
      setPolicyName('')
      setMode('archive')
      setDurationDays(365)
      setLegalHold(false)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Configure retention policy
          </DialogTitle>
          <DialogDescription>
            Set workspace-level retention with auto-archiving or deletion. Legal hold prevents
            deletion until released.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rp-workspace">Workspace</Label>
            <Select value={workspaceId} onValueChange={setWorkspaceId}>
              <SelectTrigger id="rp-workspace" className="rounded-lg bg-input">
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
            <Label htmlFor="rp-name">Policy name</Label>
            <Input
              id="rp-name"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              placeholder="e.g. Default audit retention"
              className="rounded-lg bg-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rp-mode">Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as 'archive' | 'delete')}>
              <SelectTrigger id="rp-mode" className="rounded-lg bg-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="archive">Archive (read-only)</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!legalHold && (
            <div className="space-y-2">
              <Label htmlFor="rp-duration">Duration (days)</Label>
              <Input
                id="rp-duration"
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="rounded-lg bg-input"
              />
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="rp-legal" className="cursor-pointer">
              Legal hold
            </Label>
            <Switch
              id="rp-legal"
              checked={legalHold}
              onCheckedChange={setLegalHold}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!workspaceId || !policyName.trim() || isLoading}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Archive className="mr-2 h-4 w-4" />
            )}
            Create policy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
