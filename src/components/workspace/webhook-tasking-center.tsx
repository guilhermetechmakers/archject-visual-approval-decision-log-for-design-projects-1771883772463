import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Webhook,
  CheckSquare,
  Plus,
  Settings,
  Loader2,
  Trash2,
  TestTube,
  MoreHorizontal,
  Calendar,
  User,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  useProjectTasks,
  useProjectWebhooks,
  useCreateTask,
  useCreateWebhook,
  useUpdateTask,
  useDeleteTask,
  useDeleteWebhook,
  useTestWebhook,
  useProjectWorkspace,
} from '@/hooks/use-workspace'
import { toast } from 'sonner'
import type { Task as TaskType, Webhook as WebhookType } from '@/types/workspace'

const WEBHOOK_EVENTS = [
  'decision.created',
  'decision.approved',
  'decision.rejected',
  'decision.revoked',
  'options.updated',
  'comment.added',
  'reminder.sent',
] as const

const TASK_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning/50 text-foreground',
  in_progress: 'bg-primary/20 text-primary',
  completed: 'bg-success/20 text-primary',
  overdue: 'bg-destructive/20 text-destructive',
}

export interface WebhookTaskingCenterProps {
  projectId?: string
  onAddWebhook?: () => void
  onAddTask?: () => void
  className?: string
}

export function WebhookTaskingCenter({
  projectId,
  onAddWebhook: _onAddWebhook,
  onAddTask: _onAddTask,
  className,
}: WebhookTaskingCenterProps) {
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [addWebhookOpen, setAddWebhookOpen] = useState(false)

  const { decisions, team } = useProjectWorkspace(projectId ?? '')
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(
    projectId ?? ''
  )
  const { data: webhooks = [], isLoading: webhooksLoading } =
    useProjectWebhooks(projectId ?? '')

  const createTaskMutation = useCreateTask(projectId ?? '')
  const updateTaskMutation = useUpdateTask(projectId ?? '')
  const deleteTaskMutation = useDeleteTask(projectId ?? '')
  const createWebhookMutation = useCreateWebhook(projectId ?? '')
  const deleteWebhookMutation = useDeleteWebhook(projectId ?? '')
  const testWebhookMutation = useTestWebhook(projectId ?? '')

  const teamMembers = team.filter((m) => m.role !== 'client')

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Webhooks & Tasks</h2>
        <Button asChild variant="ghost" size="sm">
          <Link
            to="/dashboard/settings/integrations"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Manage in Settings</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks Card */}
        <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Lightweight Tasks</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setAddTaskOpen(true)}
                disabled={!projectId}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 text-center">
                <CheckSquare className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No tasks yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tasks are created when decisions are approved or on schedule
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setAddTaskOpen(true)}
                  disabled={!projectId}
                >
                  Add task
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tasks.slice(0, 5).map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    decisions={decisions}
                    onUpdate={(data) => {
                      const payload: { taskId: string; status?: TaskType['status']; assignee_id?: string; due_date?: string } = {
                        taskId: task.id,
                        assignee_id: data.assignee_id,
                        due_date: data.due_date,
                      }
                      if (data.status) payload.status = data.status as TaskType['status']
                      updateTaskMutation.mutate(payload)
                    }}
                    onDelete={() => deleteTaskMutation.mutate(task.id)}
                    isUpdating={updateTaskMutation.isPending}
                    isDeleting={deleteTaskMutation.isPending}
                  />
                ))}
                {tasks.length > 5 && (
                  <p className="pt-2 text-center text-xs text-muted-foreground">
                    +{tasks.length - 5} more
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Webhooks Card */}
        <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Webhooks</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setAddWebhookOpen(true)}
                disabled={!projectId}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add webhook
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {webhooksLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : webhooks.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 text-center">
                <Webhook className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No webhooks</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Trigger Zapier, PM tools when decision status changes
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setAddWebhookOpen(true)}
                  disabled={!projectId}
                >
                  Add webhook
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {webhooks.map((webhook) => (
                  <WebhookRow
                    key={webhook.id}
                    webhook={webhook}
                    onTest={() => testWebhookMutation.mutate(webhook.id)}
                    onDelete={() => deleteWebhookMutation.mutate(webhook.id)}
                    isTesting={testWebhookMutation.isPending}
                    isDeleting={deleteWebhookMutation.isPending}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddTaskModal
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        decisions={decisions}
        teamMembers={teamMembers}
        onSubmit={async (data) => {
          await createTaskMutation.mutateAsync({
            description: data.notes?.trim() || 'Follow-up task',
            decision_id: data.decision_id,
            assignee_id: data.assignee_id,
            due_date: data.due_date,
            priority: data.priority as 'low' | 'med' | 'high',
            notes: data.notes,
          })
          setAddTaskOpen(false)
        }}
        isSubmitting={createTaskMutation.isPending}
      />

      <AddWebhookModal
        open={addWebhookOpen}
        onOpenChange={setAddWebhookOpen}
        onSubmit={async (data) => {
          await createWebhookMutation.mutateAsync(data)
          setAddWebhookOpen(false)
        }}
        isSubmitting={createWebhookMutation.isPending}
      />
    </div>
  )
}

function TaskRow({
  task,
  decisions,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  task: TaskType
  decisions: Array<{ id: string; title: string }>
  onUpdate: (data: { status?: string; assignee_id?: string; due_date?: string }) => void
  onDelete: () => void
  isUpdating: boolean
  isDeleting: boolean
}) {
  const decision = decisions.find((d) => d.id === task.decision_id)
  const statusColor = TASK_STATUS_COLORS[task.status] ?? 'bg-secondary'

  return (
    <div
      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/20 p-3 transition-colors hover:bg-secondary/30"
      role="listitem"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {decision?.title ?? 'Unknown decision'}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge className={cn('text-xs', statusColor)}>{task.status}</Badge>
          {task.due_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(task.due_at).toLocaleDateString()}
            </span>
          )}
          {task.assignee_name && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assignee_name}
            </span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            aria-label="Task actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onUpdate({ status: 'completed' as const })}
            disabled={isUpdating || task.status === 'completed'}
          >
            Mark complete
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            disabled={isDeleting}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function WebhookRow({
  webhook,
  onTest,
  onDelete,
  isTesting,
  isDeleting,
}: {
  webhook: WebhookType
  onTest: () => void
  onDelete: () => void
  isTesting: boolean
  isDeleting: boolean
}) {
  const url = webhook.target_url ?? webhook.url ?? ''
  const urlDisplay = url.length > 40 ? `${url.slice(0, 40)}…` : url

  return (
    <div
      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/20 p-3 transition-colors hover:bg-secondary/30"
      role="listitem"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs" title={url}>
          {urlDisplay}
        </p>
        <div className="mt-1 flex flex-wrap gap-1">
          {(webhook.events ?? []).slice(0, 2).map((e) => (
            <Badge key={e} variant="secondary" className="text-[10px]">
              {e.replace('decision.', '')}
            </Badge>
          ))}
          {(webhook.events ?? []).length > 2 && (
            <Badge variant="outline" className="text-[10px]">
              +{(webhook.events ?? []).length - 2}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onTest}
          disabled={isTesting}
          aria-label="Test webhook"
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TestTube className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label="Delete webhook"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function AddTaskModal({
  open,
  onOpenChange,
  decisions,
  teamMembers,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  decisions: Array<{ id: string; title: string }>
  teamMembers: Array<{ user_id: string; name: string }>
  onSubmit: (data: {
    decision_id: string
    assignee_id?: string
    due_date?: string
    priority?: string
    notes?: string
  }) => Promise<void>
  isSubmitting: boolean
}) {
  const [decisionId, setDecisionId] = useState('')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<string>('med')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!decisionId) {
      toast.error('Select a decision')
      return
    }
    await onSubmit({
      decision_id: decisionId,
      assignee_id: assigneeId || undefined,
      due_date: dueDate || undefined,
      priority: priority || undefined,
      notes: notes.trim() || undefined,
    })
    setDecisionId('')
    setAssigneeId('')
    setDueDate('')
    setPriority('med')
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Create a task linked to a decision. Tasks can be triggered on
            approval outcomes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-decision">Decision</Label>
            <Select
              value={decisionId}
              onValueChange={setDecisionId}
              required
            >
              <SelectTrigger id="task-decision">
                <SelectValue placeholder="Select decision" />
              </SelectTrigger>
              <SelectContent>
                {decisions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-assignee">Assignee</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger id="task-assignee">
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {teamMembers.map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="med">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              placeholder="Task description or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddWebhookModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    url: string
    events: string[]
    signing_secret?: string
  }) => Promise<void>
  isSubmitting: boolean
}) {
  const [url, setUrl] = useState('')
  const [events, setEvents] = useState<string[]>(['decision.created', 'decision.approved'])
  const [signingSecret, setSigningSecret] = useState('')

  const toggleEvent = (event: string) => {
    setEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      toast.error('Enter webhook URL')
      return
    }
    try {
      new URL(url)
    } catch {
      toast.error('Enter a valid URL')
      return
    }
    if (events.length === 0) {
      toast.error('Select at least one event')
      return
    }
    await onSubmit({
      url: url.trim(),
      events,
      signing_secret: signingSecret.trim() || undefined,
    })
    setUrl('')
    setEvents(['decision.created', 'decision.approved'])
    setSigningSecret('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Webhook</DialogTitle>
          <DialogDescription>
            Receive payloads when decisions are created, approved, or rejected.
            Zapier-compatible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://hooks.zapier.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Events</Label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3">
              {WEBHOOK_EVENTS.map((event) => (
                <div
                  key={event}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`evt-${event}`}
                    checked={events.includes(event)}
                    onCheckedChange={() => toggleEvent(event)}
                  />
                  <label
                    htmlFor={`evt-${event}`}
                    className="text-sm cursor-pointer"
                  >
                    {event.replace('decision.', '')}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook-secret">Signing secret (optional)</Label>
            <Input
              id="webhook-secret"
              type="password"
              placeholder="HMAC secret for payload verification"
              value={signingSecret}
              onChange={(e) => setSigningSecret(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Add webhook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
