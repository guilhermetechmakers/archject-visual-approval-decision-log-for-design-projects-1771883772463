import { Webhook, Plus, Zap, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSettingsWebhooks } from '@/hooks/use-settings'

export function WebhooksCard() {
  const { data: webhooks } = useSettingsWebhooks()

  const items = webhooks ?? []

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-primary" />
          <CardTitle>Light tasking & webhooks</CardTitle>
        </div>
        <CardDescription>
          Create tasks from approvals and trigger webhooks to Zapier or PM tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 p-4">
          <Zap className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Zapier</p>
            <p className="text-sm text-muted-foreground">
              Connect via Zapier to automate workflows
            </p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            Connect
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Webhook endpoints</Label>
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
              <Webhook className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No webhooks configured</p>
              <Button variant="outline" size="sm" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add endpoint
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((wh) => (
                <div
                  key={wh.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <code className="text-sm">{wh.url}</code>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Events: {wh.events.join(', ')}
                    </p>
                    {wh.lastTest && (
                      <p className="text-xs text-muted-foreground">
                        Last test: {new Date(wh.lastTest).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Test
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
