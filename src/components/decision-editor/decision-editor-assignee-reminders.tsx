import { Plus, X, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDecisionEditor } from '@/contexts/decision-editor-context'
import type { ReminderForm } from '@/types/decision-editor'
import type { TeamMember } from '@/types/workspace'

function generateId(): string {
  return `rem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface DecisionEditorAssigneeRemindersProps {
  teamMembers: TeamMember[]
  onNext?: () => void
}

export function DecisionEditorAssigneeReminders({
  teamMembers,
  onNext,
}: DecisionEditorAssigneeRemindersProps) {
  const {
    assigneeId,
    setAssignee,
    reminders,
    addReminder,
    updateReminder,
    removeReminder,
    setStep,
  } = useDecisionEditor()

  const assignees = teamMembers.filter((m) => m.role !== 'client')

  const handleAddReminder = () => {
    addReminder({
      id: generateId(),
      scheduleType: 'date',
      scheduleValue: '',
      message: 'Approval deadline approaching',
      channel: 'email',
      enabled: true,
    })
  }

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else {
      setStep('review')
    }
  }

  return (
    <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Assignee & reminders</CardTitle>
        <p className="text-sm text-muted-foreground">
          Assign an owner and schedule reminders. Integrate with Google Calendar.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Assignee (owner)</Label>
          <Select
            value={assigneeId || undefined}
            onValueChange={(v) => setAssignee(v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {assignees.map((m) => (
                <SelectItem key={m.id} value={m.user_id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Reminders</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddReminder}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add reminder
            </Button>
          </div>

          {reminders.length === 0 ? (
            <div className="flex items-center gap-4 rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6">
              <Calendar className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">No reminders</p>
                <p className="text-sm text-muted-foreground">
                  Add reminders for approval deadline, draft to pending, etc.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleAddReminder}
                >
                  Add reminder
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/20 p-4 sm:flex-row sm:items-end"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label>When</Label>
                    <Input
                      type="datetime-local"
                      value={reminder.scheduleValue || ''}
                      onChange={(e) =>
                        updateReminder(reminder.id, {
                          scheduleType: 'date',
                          scheduleValue: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label>Message</Label>
                    <Input
                      value={reminder.message}
                      onChange={(e) =>
                        updateReminder(reminder.id, { message: e.target.value })
                      }
                      placeholder="Reminder message"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={reminder.channel}
                      onValueChange={(v) =>
                        updateReminder(reminder.id, {
                          channel: v as ReminderForm['channel'],
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                        <SelectItem value="calendar">Calendar</SelectItem>
                      </SelectContent>
                    </Select>
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={(v) =>
                        updateReminder(reminder.id, { enabled: v })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeReminder(reminder.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove reminder"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/20 p-4">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Google Calendar integration</p>
            <p className="text-sm text-muted-foreground">
              Sync reminders to your calendar
            </p>
          </div>
          <Switch className="ml-auto" disabled />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleNext}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Next: Review & Publish
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
