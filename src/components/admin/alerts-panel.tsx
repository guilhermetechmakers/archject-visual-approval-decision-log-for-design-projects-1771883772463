/**
 * Alerts Panel - system alerts and maintenance windows.
 */

import { AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { SystemAlert } from '@/types/admin'
import { cn } from '@/lib/utils'

interface AlertsPanelProps {
  alerts: SystemAlert[]
  className?: string
}

const typeConfig: Record<
  SystemAlert['type'],
  { icon: typeof Info; variant: 'default' | 'success' | 'warning' | 'destructive' }
> = {
  info: { icon: Info, variant: 'default' },
  warning: { icon: AlertTriangle, variant: 'warning' },
  error: { icon: XCircle, variant: 'destructive' },
  maintenance: { icon: AlertCircle, variant: 'warning' },
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AlertsPanel({ alerts, className }: AlertsPanelProps) {
  if (!alerts || alerts.length === 0) return null

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="h-5 w-5 text-primary" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32">
          <ul className="space-y-3">
            {alerts.map((alert) => {
              const config = typeConfig[alert.type]
              const Icon = config.icon
              return (
                <li
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3"
                >
                  <Icon
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      alert.type === 'error' && 'text-destructive',
                      alert.type === 'warning' && 'text-warning',
                      alert.type === 'maintenance' && 'text-warning',
                      alert.type === 'info' && 'text-muted-foreground'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(alert.created_at)}
                      {alert.resolved_at && ` · Resolved ${formatDate(alert.resolved_at)}`}
                    </p>
                  </div>
                  <Badge variant={config.variant} className="shrink-0 capitalize">
                    {alert.type}
                  </Badge>
                </li>
              )
            })}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
