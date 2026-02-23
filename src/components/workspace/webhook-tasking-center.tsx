import { Webhook, CheckSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface WebhookTaskingCenterProps {
  projectId?: string
  onAddWebhook?: () => void
  onAddTask?: () => void
  className?: string
}

export function WebhookTaskingCenter({
  projectId: _projectId,
  onAddWebhook,
  onAddTask,
  className,
}: WebhookTaskingCenterProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h2 className="text-lg font-semibold">Webhooks & Tasks</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="transition-all hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Webhooks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Trigger Zapier, Google Calendar, or PM tools when decision status
              changes.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onAddWebhook}
            >
              Add webhook
            </Button>
          </CardContent>
        </Card>
        <Card className="transition-all hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Lightweight tasks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create tasks triggered by approval outcomes. Map to external
              actions.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onAddTask}
            >
              Create task
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
