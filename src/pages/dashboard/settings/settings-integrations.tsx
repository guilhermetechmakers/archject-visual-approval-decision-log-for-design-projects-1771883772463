import { IntegrationsCard, NotificationIntegrationsCard, WebhooksCard } from '@/components/settings'

export function SettingsIntegrations() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="mt-1 text-muted-foreground">
          Google Calendar, Autodesk Forge, Zapier, Stripe, SendGrid, Twilio
        </p>
      </div>
      <NotificationIntegrationsCard />
      <IntegrationsCard />
      <WebhooksCard />
    </div>
  )
}
