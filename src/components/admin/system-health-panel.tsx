/**
 * System Health Panel - uptime, latency, errors, backlog.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'
import { mockHealthHistory } from '@/lib/admin-mock'
import type { SystemHealth } from '@/types/admin'
import { cn } from '@/lib/utils'

interface SystemHealthPanelProps {
  data: SystemHealth
  className?: string
}

const chartData = mockHealthHistory.slice(-12).map((h, i) => ({
  name: `${i + 1}h`,
  uptime: h.uptime_pct,
  latency: h.api_latency_ms,
}))

function getStatusColor(uptime: number) {
  if (uptime >= 99.9) return 'success'
  if (uptime >= 99) return 'warning'
  return 'destructive'
}

export function SystemHealthPanel({ data, className }: SystemHealthPanelProps) {
  const statusVariant = getStatusColor(data.uptime_pct)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          System Health
        </CardTitle>
        <Badge variant={statusVariant as 'success' | 'warning' | 'destructive'}>
          {data.uptime_pct >= 99.9 ? 'Healthy' : data.uptime_pct >= 99 ? 'Degraded' : 'Issues'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-lg font-semibold">{data.uptime_pct}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">API Latency</p>
            <p className="text-lg font-semibold">{data.api_latency_ms}ms</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Errors (24h)</p>
            <p className="text-lg font-semibold">{data.errors_last_24h}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Backlog</p>
            <p className="text-lg font-semibold">{data.backlog_size}</p>
          </div>
          {data.redis_health && (
            <div>
              <p className="text-xs text-muted-foreground">Redis</p>
              <p
                className={cn(
                  'text-lg font-semibold',
                  data.redis_health === 'healthy' && 'text-success',
                  data.redis_health === 'degraded' && 'text-warning',
                  data.redis_health === 'unavailable' && 'text-destructive'
                )}
              >
                {data.redis_health === 'healthy'
                  ? 'Healthy'
                  : data.redis_health === 'degraded'
                    ? 'Degraded'
                    : 'Unavailable'}
              </p>
            </div>
          )}
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="rgb(var(--muted-foreground))" />
              <YAxis hide domain={[99, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '0.5rem',
                }}
                formatter={(value) => [`${value != null ? `${value}%` : '—'}`, 'Uptime']}
              />
              <Line
                type="monotone"
                dataKey="uptime"
                stroke="rgb(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
