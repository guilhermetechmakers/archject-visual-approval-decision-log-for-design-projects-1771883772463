/**
 * Third-Party Integrations Dashboard
 * Connect/disconnect Google Calendar, Autodesk Forge, Zapier
 * OAuth flows, status indicators, field mapping UI
 */

import { useState } from 'react'
import {
  Calendar,
  Box,
  Zap,
  Plug,
  Loader2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Settings2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useIntegrationsList,
  useConnectIntegration,
  useDisconnectIntegration,
} from '@/hooks/use-integrations'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { IntegrationDisplay, IntegrationProvider } from '@/types/integrations'
import { IntegrationFieldMappingPanel } from './integration-field-mapping-panel'

const PROVIDERS: {
  id: IntegrationProvider
  name: string
  description: string
  icon: React.ElementType
  scopes: string[]
}[] = [
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Create calendar events from decision deadlines and reminders',
    icon: Calendar,
    scopes: ['calendar.events', 'calendar.readonly'],
  },
  {
    id: 'autodesk_forge',
    name: 'Autodesk Forge',
    description: 'BIM/CAD viewer for IFC/DWG previews in decisions',
    icon: Box,
    scopes: ['data:read', 'viewables:read'],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps via webhooks',
    icon: Zap,
    scopes: ['webhooks:write'],
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'connected':
      return (
        <Badge className="bg-success/20 text-success border-0">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Connected
        </Badge>
      )
    case 'error':
      return (
        <Badge className="bg-destructive/20 text-destructive border-0">
          <AlertCircle className="mr-1 h-3 w-3" />
          Error
        </Badge>
      )
    case 'pending':
      return (
        <Badge variant="secondary" className="border-0">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Pending
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Disconnected
        </Badge>
      )
  }
}

export function IntegrationsDashboard() {
  const { data: integrations, isLoading } = useIntegrationsList()
  const connectMutation = useConnectIntegration()
  const disconnectMutation = useDisconnectIntegration()
  const [mappingPanelIntegration, setMappingPanelIntegration] = useState<IntegrationDisplay | null>(null)

  const items = integrations ?? []
  const getIntegration = (provider: IntegrationProvider) =>
    items.find((i) => i.type === provider)

  const handleConnect = async (provider: IntegrationProvider) => {
    try {
      await connectMutation.mutateAsync({ provider })
      toast.success(`Redirecting to ${provider.replace('_', ' ')}...`)
    } catch {
      toast.error('Failed to connect')
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    try {
      await disconnectMutation.mutateAsync(integrationId)
      toast.success('Disconnected')
    } catch {
      toast.error('Failed to disconnect')
    }
  }

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-border shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-4/5 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-primary" />
            <CardTitle>Third-Party Integrations</CardTitle>
          </div>
          <CardDescription>
            Connect Google Calendar, Autodesk Forge, and Zapier. OAuth flows, token management, and
            field mapping for decision metadata sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {PROVIDERS.map((provider) => {
            const Icon = provider.icon
            const integration = getIntegration(provider.id)
            const isConnected = integration?.status === 'connected'

            return (
              <div
                key={provider.id}
                className={`rounded-xl border p-4 transition-all duration-200 ${
                  isConnected
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-card hover:bg-secondary/30'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                        isConnected ? 'bg-primary/20' : 'bg-secondary'
                      )}
                    >
                      <Icon className={cn('h-6 w-6', isConnected ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">{provider.name}</h3>
                        {getStatusBadge(integration?.status ?? 'disconnected')}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {provider.description}
                      </p>
                      {integration?.lastSyncAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                        </p>
                      )}
                      {integration?.lastError && (
                        <p className="mt-1 text-xs text-destructive">{integration.lastError}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          onClick={() => integration && setMappingPanelIntegration(integration)}
                        >
                          <Settings2 className="mr-2 h-4 w-4" />
                          Field mapping
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                          onClick={() => integration && handleDisconnect(integration.id)}
                          disabled={disconnectMutation.isPending}
                        >
                          {disconnectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Disconnect'
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="rounded-full bg-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => handleConnect(provider.id)}
                        disabled={connectMutation.isPending}
                      >
                        {connectMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Connect
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {mappingPanelIntegration && (
        <IntegrationFieldMappingPanel
          integration={mappingPanelIntegration}
          open={!!mappingPanelIntegration}
          onOpenChange={(open) => !open && setMappingPanelIntegration(null)}
        />
      )}
    </>
  )
}
