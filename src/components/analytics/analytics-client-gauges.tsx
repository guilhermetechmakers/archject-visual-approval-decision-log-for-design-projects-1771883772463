/**
 * Client responsiveness gauges
 */

import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ClientResponsiveness } from '@/types/analytics'

export interface AnalyticsClientGaugesProps {
  data: ClientResponsiveness[]
  className?: string
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

export function AnalyticsClientGauges({ data, className }: AnalyticsClientGaugesProps) {
  return (
    <Card className={cn('rounded-2xl border border-border shadow-card', className)}>
      <CardHeader>
        <CardTitle>Client responsiveness</CardTitle>
        <p className="text-sm text-muted-foreground">
          Average response time and response rate by client
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground">No client data in this period</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try selecting a different date range
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((client) => (
              <div key={client.clientId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate max-w-[180px]" title={client.clientName}>
                    {client.clientName}
                  </span>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-muted-foreground">
                      {formatHours(client.avgResponseTimeHours)} avg
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        client.responseRate >= 80
                          ? 'text-success'
                          : client.responseRate >= 60
                            ? 'text-warning'
                            : 'text-destructive'
                      )}
                    >
                      {client.responseRate}% rate
                    </span>
                  </div>
                </div>
                <Progress
                  value={client.responseRate}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
