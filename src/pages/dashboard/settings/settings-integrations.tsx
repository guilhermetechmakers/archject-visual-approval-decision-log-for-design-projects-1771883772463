import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plug, Bell, Zap, Webhook } from 'lucide-react'
import {
  IntegrationsDashboard,
  NotificationIntegrationsCard,
  WebhooksCard,
} from '@/components/settings'
import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function SettingsIntegrations() {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    if (success) {
      toast.success(`${success.replace(/_/g, ' ')} connected successfully`)
      setSearchParams({}, { replace: true })
    }
    if (error) {
      toast.error(
        error === 'config' ? 'Integration not configured' : `Connection failed: ${error}`
      )
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card
        className={cn(
          'rounded-xl border border-border shadow-card transition-all duration-200',
          'hover:shadow-card-hover'
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"
              aria-hidden
            >
              <Plug className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Integrations
              </h1>
              <CardDescription className="mt-1.5">
                Connect Google Calendar, Autodesk Forge, and Zapier. OAuth flows, field mapping,
                and webhook triggers for decision workflows.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section aria-labelledby="notification-delivery-heading" className="space-y-3 sm:space-y-4">
        <h2
          id="notification-delivery-heading"
          className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg"
        >
          <Bell className="h-5 w-5 text-primary" aria-hidden />
          Notification delivery
        </h2>
        <NotificationIntegrationsCard />
      </section>

      <section aria-labelledby="third-party-integrations-heading" className="space-y-3 sm:space-y-4">
        <h2
          id="third-party-integrations-heading"
          className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg"
        >
          <Zap className="h-5 w-5 text-primary" aria-hidden />
          Third-party integrations
        </h2>
        <IntegrationsDashboard />
      </section>

      <section aria-labelledby="webhooks-heading" className="space-y-3 sm:space-y-4">
        <h2
          id="webhooks-heading"
          className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg"
        >
          <Webhook className="h-5 w-5 text-primary" aria-hidden />
          Webhooks & automation
        </h2>
        <WebhooksCard />
      </section>
    </div>
  )
}
