/**
 * Integration Activity Widget - Recent calendar events, Forge previews, webhook deliveries
 * Per-project integration activity
 */

import { Link } from 'react-router-dom'
import { Calendar, Box, Webhook, Settings, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjectIntegrationActivity } from '@/hooks/use-integrations'
import { cn } from '@/lib/utils'

export interface IntegrationActivityWidgetProps {
  projectId: string
  className?: string
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  calendar_event: Calendar,
  forge_preview: Box,
  webhook_delivery: Webhook,
}

export function IntegrationActivityWidget({
  projectId,
  className,
}: IntegrationActivityWidgetProps) {
  const { data: activities = [], isLoading } = useProjectIntegrationActivity(projectId)

  return (
    <Card
      className={cn(
        'rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Integration Activity</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link
              to="/dashboard/settings/integrations"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Recent calendar events, Forge previews, and webhook deliveries
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 py-12 text-center">
            <Activity className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">No integration activity yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Calendar events and Forge previews will appear here
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/dashboard/settings/integrations">Configure integrations</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activities.slice(0, 8).map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] ?? Activity
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {activity.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'shrink-0 text-xs',
                      activity.status === 'created' && 'bg-success/20 text-success',
                      activity.status === 'failed' && 'bg-destructive/20 text-destructive'
                    )}
                  >
                    {activity.status}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
