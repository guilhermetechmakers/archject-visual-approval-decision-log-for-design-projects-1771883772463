import { GitBranch, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubscriptionTimeline } from '@/hooks/use-billing-history'
import type { SubscriptionTimelineEvent } from '@/types/billing-history'
import { cn } from '@/lib/utils'

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  plan_change: GitBranch,
  proration: GitBranch,
  trial_start: GitBranch,
  trial_end: GitBranch,
  renewal: GitBranch,
  add_on: GitBranch,
  suspension: GitBranch,
  cancellation: GitBranch,
}

const EVENT_LABELS: Record<string, string> = {
  plan_change: 'Plan change',
  proration: 'Proration',
  trial_start: 'Trial started',
  trial_end: 'Trial ended',
  renewal: 'Renewal',
  add_on: 'Add-on',
  suspension: 'Suspension',
  cancellation: 'Cancellation',
}

interface SubscriptionTimelineProps {
  subscriptionId: string | null
  onHighlightItem?: (id: string | null) => void
  highlightedId?: string | null
  onViewInvoice?: (invoiceId: string) => void
}

function TimelineEventCard({
  event,
  onHighlightItem,
  isHighlighted,
  onViewInvoice,
}: {
  event: SubscriptionTimelineEvent
  onHighlightItem?: (id: string | null) => void
  isHighlighted?: boolean
  onViewInvoice?: (invoiceId: string) => void
}) {
  const Icon = EVENT_ICONS[event.event_type] ?? GitBranch
  const label = EVENT_LABELS[event.event_type] ?? event.event_type

  return (
    <div
      className={cn(
        'relative flex gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-card hover:border-primary/20',
        isHighlighted && 'ring-2 ring-primary/30 border-primary/30'
      )}
    >
      <div className="absolute left-4 top-10 bottom-4 w-px bg-border" aria-hidden />
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(event.event_date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{event.description}</p>
        {(event.affected_plan || event.affected_addon) && (
          <p className="text-xs text-muted-foreground">
            {event.affected_plan && `Plan: ${event.affected_plan}`}
            {event.affected_plan && event.affected_addon && ' · '}
            {event.affected_addon && `Add-on: ${event.affected_addon}`}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          {event.related_history_id && onHighlightItem && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs rounded-lg"
              onClick={() => onHighlightItem(event.related_history_id!)}
            >
              View related transaction
            </Button>
          )}
          {event.invoice_id && onViewInvoice && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs rounded-lg"
              onClick={() => onViewInvoice(event.invoice_id!)}
            >
              <FileText className="h-3 w-3" />
              View invoice
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function SubscriptionTimeline({
  subscriptionId,
  onHighlightItem,
  highlightedId,
  onViewInvoice,
}: SubscriptionTimelineProps) {
  const { data, isLoading } = useSubscriptionTimeline(subscriptionId)
  const events = data?.events ?? []

  return (
    <Card className="rounded-2xl border border-border shadow-card transition-all duration-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Subscription timeline</CardTitle>
            <CardDescription>
              Plan changes, proration, trials, and renewals
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-foreground">
              No subscription events yet
            </p>
            <p className="text-sm text-muted-foreground">
              Events will appear here when your subscription changes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event: SubscriptionTimelineEvent) => (
              <TimelineEventCard
                key={event.id}
                event={event}
                onHighlightItem={onHighlightItem}
                isHighlighted={highlightedId === event.related_history_id}
                onViewInvoice={onViewInvoice}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
