import { CreditCard, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useBillingSubscription } from '@/hooks/use-billing'
import { cn } from '@/lib/utils'
import type { BillingSubscription } from '@/types/billing'

interface CurrentPlanCardProps {
  onChangePlan: () => void
}

function formatLimit(used: number, limit: number): string {
  if (limit < 0) return `${used} used`
  return `${used} / ${limit}`
}

function UsageMeter({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
  const isWarning = limit > 0 && used >= limit * 0.8
  const isOver = limit > 0 && used > limit

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={cn(
            'font-medium',
            isOver && 'text-destructive',
            isWarning && !isOver && 'text-warning-muted'
          )}
        >
          {formatLimit(used, limit)}
        </span>
      </div>
      {limit > 0 && (
        <Progress
          value={pct}
          className={cn(
            'h-2',
            isOver && '[&>div]:bg-destructive',
            isWarning && !isOver && '[&>div]:bg-warning'
          )}
        />
      )}
    </div>
  )
}

export function CurrentPlanCard({ onChangePlan }: CurrentPlanCardProps) {
  const { data, isLoading } = useBillingSubscription()

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  const sub = data as BillingSubscription
  const plan = sub?.plan
  const usage = sub?.usage
  const nextBilling = sub?.subscription?.next_billing_date
  const status = sub?.subscription?.status
  const renewalStatus = sub?.renewal_status ?? 'renewing'

  return (
    <Card className="rounded-2xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <CardTitle>Current plan</CardTitle>
        </div>
        <CardDescription>
          Manage your subscription, limits, and renewal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="text-lg font-semibold text-foreground">{plan?.name ?? 'Starter'}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {plan?.currency ?? 'USD'} {plan?.price ?? 29}/{plan?.interval === 'yearly' ? 'yr' : 'mo'}
            </p>
            {plan?.features?.length ? (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {plan.features.slice(0, 3).map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={status === 'active' ? 'success' : status === 'past_due' ? 'destructive' : 'secondary'}
            >
              {status === 'active' ? 'Active' : status === 'past_due' ? 'Past due' : status}
            </Badge>
            {renewalStatus === 'canceling' && (
              <Badge variant="warning">Canceling</Badge>
            )}
          </div>
        </div>

        {nextBilling && (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              Next billing date: {new Date(nextBilling).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {renewalStatus === 'renewing'
                ? 'Your subscription will renew automatically'
                : renewalStatus === 'canceling'
                  ? 'Your subscription will end at the end of the current period'
                  : 'Update your payment method to avoid interruption'}
            </p>
          </div>
        )}

        {usage && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">Usage this period</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {usage.projects && (
                <UsageMeter
                  label="Projects"
                  used={usage.projects.used}
                  limit={usage.projects.limit}
                />
              )}
              {usage.decisions && (
                <UsageMeter
                  label="Decisions"
                  used={usage.decisions.used}
                  limit={usage.decisions.limit}
                />
              )}
              {usage.storage && (
                <UsageMeter
                  label="Storage (GB)"
                  used={Math.round(usage.storage.used * 10) / 10}
                  limit={usage.storage.limit}
                />
              )}
            </div>
          </div>
        )}

        <Button
          onClick={onChangePlan}
          className="w-full sm:w-auto transition-transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Change subscription plan"
        >
          Change plan
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </CardContent>
    </Card>
  )
}
