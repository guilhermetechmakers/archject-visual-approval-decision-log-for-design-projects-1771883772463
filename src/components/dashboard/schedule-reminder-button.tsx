/**
 * Schedule Reminder - quick action to schedule a reminder for decisions awaiting client
 */

import { useState } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { AwaitingApproval } from '@/types/dashboard'

export interface ScheduleReminderButtonProps {
  approvals: AwaitingApproval[]
  onSchedule?: (decisionId: string, reminderAt: string) => Promise<void>
  className?: string
}

export function ScheduleReminderButton({
  approvals,
  onSchedule,
  className,
}: ScheduleReminderButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [reminderDate, setReminderDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSchedule = async () => {
    if (!selectedId || !reminderDate) {
      toast.error('Please select a decision and reminder date')
      return
    }
    setIsLoading(true)
    try {
      if (onSchedule) {
        await onSchedule(selectedId, reminderDate)
      } else {
        await new Promise((r) => setTimeout(r, 500))
      }
      toast.success('Reminder scheduled')
      setOpen(false)
      setSelectedId('')
      setReminderDate('')
    } catch {
      toast.error('Failed to schedule reminder')
    } finally {
      setIsLoading(false)
    }
  }

  const pendingCount = approvals.filter((a) => a.status === 'pending').length
  if (approvals.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={className}
          aria-label="Schedule reminder"
        >
          <Bell className="mr-2 h-4 w-4" />
          Schedule reminder
          {pendingCount > 0 && (
            <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 text-xs">
              {pendingCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Schedule reminder</DialogTitle>
          <DialogDescription>
            Get reminded to follow up on decisions awaiting client response
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-decision">Decision</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger id="reminder-decision" className="rounded-lg">
                <SelectValue placeholder="Select decision" />
              </SelectTrigger>
              <SelectContent>
                {approvals.map((a) => (
                  <SelectItem key={a.decision_id} value={a.decision_id}>
                    {a.title}
                    {a.project_name && ` (${a.project_name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-date">Remind me on</Label>
            <Input
              id="reminder-date"
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="rounded-lg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Schedule'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
