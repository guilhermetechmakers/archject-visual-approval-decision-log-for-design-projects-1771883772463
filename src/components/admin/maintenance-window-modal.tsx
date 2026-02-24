/**
 * Maintenance Window Modal - trigger start/stop maintenance with confirmation.
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
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface MaintenanceWindowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string, durationMinutes: number) => void
  isLoading?: boolean
}

const CONFIRMATION_LABEL =
  'I understand this will display a maintenance notice to all users.'

export function MaintenanceWindowModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: MaintenanceWindowModalProps) {
  const [reason, setReason] = React.useState('')
  const [durationMinutes, setDurationMinutes] = React.useState(30)
  const [confirmed, setConfirmed] = React.useState(false)

  const handleConfirm = () => {
    if (!confirmed || !reason.trim()) return
    onConfirm(reason.trim(), durationMinutes)
    onOpenChange(false)
    setReason('')
    setDurationMinutes(30)
    setConfirmed(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason('')
      setDurationMinutes(30)
      setConfirmed(false)
    }
    onOpenChange(next)
  }

  const isFormDisabled = isLoading

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle
              className="h-5 w-5 text-warning"
              aria-hidden
            />
            Trigger Maintenance Window
          </DialogTitle>
          <DialogDescription>
            Start a maintenance window to perform system updates. Users will see
            a maintenance notice. This action is logged in the audit trail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="maintenance-reason">Reason (required)</Label>
            <Input
              id="maintenance-reason"
              placeholder="e.g. Database migration, security patch"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenance-duration">Duration (minutes)</Label>
            <Input
              id="maintenance-duration"
              type="number"
              min={5}
              max={480}
              value={durationMinutes}
              onChange={(e) =>
                setDurationMinutes(
                  Math.max(5, Math.min(480, Number(e.target.value) || 30))
                )
              }
              disabled={isFormDisabled}
            />
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <Checkbox
              id="maintenance-confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              disabled={isFormDisabled}
              aria-label={CONFIRMATION_LABEL}
              className="peer mt-0.5 shrink-0"
            />
            <Label
              htmlFor="maintenance-confirm"
              className="cursor-pointer text-sm font-normal text-foreground leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              {CONFIRMATION_LABEL}
            </Label>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || !confirmed || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden
                />
                Starting…
              </>
            ) : (
              'Start Maintenance'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
