/**
 * Recent Escalations Panel - recent support escalations.
 */

import { Link } from 'react-router-dom'
import { TicketPlus, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Escalation } from '@/types/admin'
import { cn } from '@/lib/utils'

interface RecentEscalationsPanelProps {
  escalations: Escalation[]
  className?: string
}

const priorityVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  low: 'default',
  medium: 'default',
  high: 'warning',
  critical: 'destructive',
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  open: 'destructive',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
}

function formatDate(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return d.toLocaleDateString()
}

export function RecentEscalationsPanel({ escalations, className }: RecentEscalationsPanelProps) {
  if (!escalations || escalations.length === 0) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TicketPlus className="h-5 w-5 text-primary" />
            Recent Escalations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TicketPlus className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No recent escalations</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/tools">View Tools</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const recent = escalations.slice(0, 5)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TicketPlus className="h-5 w-5 text-primary" />
          Recent Escalations
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/tools" className="flex items-center gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recent.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {e.workspace_id} · {formatDate(e.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Badge variant={priorityVariant[e.priority] ?? 'default'} className="text-xs">
                  {e.priority}
                </Badge>
                <Badge variant={statusVariant[e.status] ?? 'default'} className="text-xs">
                  {e.status}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
