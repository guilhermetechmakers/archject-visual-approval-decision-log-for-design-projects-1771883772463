import { Plug, Calendar, Box, Zap, CreditCard, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSettingsIntegrations, useConnectIntegration, useDisconnectIntegration } from '@/hooks/use-settings'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const INTEGRATION_ICONS: Record<string, React.ElementType> = {
  google_calendar: Calendar,
  autodesk_forge: Box,
  zapier: Zap,
  stripe: CreditCard,
}

export function IntegrationsCard() {
  const { data: integrations, isLoading } = useSettingsIntegrations()
  const connectMutation = useConnectIntegration()
  const disconnectMutation = useDisconnectIntegration()

  const handleConnect = async (type: string) => {
    try {
      await connectMutation.mutateAsync({ type })
      toast.success(`${type.replace('_', ' ')} connected`)
    } catch {
      toast.error('Failed to connect')
    }
  }

  const handleDisconnect = async (id: string) => {
    try {
      await disconnectMutation.mutateAsync(id)
      toast.success('Disconnected')
    } catch {
      toast.error('Failed to disconnect')
    }
  }

  if (isLoading) return null

  const items = integrations ?? []

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          <CardTitle>Integrations</CardTitle>
        </div>
        <CardDescription>
          Connect Google Calendar, Autodesk Forge, Zapier, and Stripe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((int) => {
            const Icon = INTEGRATION_ICONS[int.type] ?? Plug
            const isConnected = int.status === 'connected'
            return (
              <div
                key={int.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{int.name}</p>
                    {int.connectedAt && (
                      <p className="text-xs text-muted-foreground">
                        Connected {new Date(int.connectedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isConnected ? 'secondary' : 'outline'}
                    className={cn(
                      isConnected && 'bg-success/20 text-success',
                      int.status === 'error' && 'bg-destructive/20 text-destructive'
                    )}
                  >
                    {int.status}
                  </Badge>
                  {isConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(int.id)}
                      disabled={disconnectMutation.isPending}
                    >
                      {disconnectMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Disconnect'
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(int.type)}
                      disabled={connectMutation.isPending}
                    >
                      {connectMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
