import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  IntegrationsDashboard,
  NotificationIntegrationsCard,
  WebhooksCard,
} from '@/components/settings'
import { toast } from 'sonner'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="mt-1 text-muted-foreground">
          Connect Google Calendar, Autodesk Forge, and Zapier. OAuth flows, field mapping, and
          webhook triggers for decision workflows.
        </p>
      </div>
      <NotificationIntegrationsCard />
      <IntegrationsDashboard />
      <WebhooksCard />
    </div>
  )
}
