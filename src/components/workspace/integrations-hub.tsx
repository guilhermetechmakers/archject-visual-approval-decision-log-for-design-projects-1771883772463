import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Box, Zap, Settings, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjectIntegrations, useProjectIntegrationActivity } from '@/hooks/use-integrations'
import { cn } from '@/lib/utils'

export interface IntegrationsHubProps {
  projectId?: string
  onConfigure?: (integration: string) => void
  className?: string
}

const INTEGRATION_CONFIG = [
  { id: 'google-calendar', type: 'google_calendar', name: 'Google Calendar', description: 'Create calendar events from decision deadlines', icon: Calendar },
  { id: 'autodesk-forge', type: 'autodesk_forge', name: 'Autodesk Forge', description: 'BIM/CAD viewer links for drawings', icon: Box },
  { id: 'zapier', type: 'zapier', name: 'Zapier', description: 'Connect to 5000+ apps via webhooks', icon: Zap },
] as const

export function IntegrationsHub({
  projectId,
  onConfigure,
  className,
}: IntegrationsHubProps) {
  const navigate = useNavigate()
  const { data: integrations = [], isLoading } = useProjectIntegrations(projectId ?? '')
  const { data: activity = [], isLoading: activityLoading } = useProjectIntegrationActivity(projectId ?? '')

  const handleConfigure = (integrationId: string) => {
    if (onConfigure) {
      onConfigure(integrationId)
    } else {
      navigate('/dashboard/settings/integrations')
    }
  }

  const getStatus = (type: string) => {
    const int = integrations.find((i) => i.type === type)
    return int?.status ?? 'disconnected'
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Integrations</h2>
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
      <div className="grid gap-4 sm:grid-cols-3">
        {INTEGRATION_CONFIG.map((int) => {
          const Icon = int.icon
          const status = getStatus(int.type)
          const isConnected = status === 'connected'
          return (
            <Card
              key={int.id}
              className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{int.name}</CardTitle>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-5 w-16 rounded-full" />
                  ) : (
                    <Badge
                      variant={isConnected ? 'secondary' : 'outline'}
                      className={cn(
                        'text-xs',
                        isConnected && 'bg-success/20 text-success',
                        status === 'error' && 'bg-destructive/20 text-destructive'
                      )}
                    >
                      {status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {int.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => handleConfigure(int.id)}
                >
                  Configure
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {projectId && activity.length > 0 && (
        <Card className="rounded-xl border border-border shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Recent activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activity.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {a.type === 'calendar_event' && 'Calendar'}{' '}
                      {a.type === 'forge_preview' && 'Forge'}{' '}
                      {a.type === 'webhook_delivery' && 'Webhook'}{' '}
                      {a.action}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
