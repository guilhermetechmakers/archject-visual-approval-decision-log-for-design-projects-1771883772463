import { Link } from 'react-router-dom'
import { CreditCard, FileText, ArrowRight, AlertCircle, Receipt } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSettingsBilling } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface BillingCardProps {
  /** When true, renders content only (no Card wrapper) for embedding in parent Card */
  embedded?: boolean
}

export function BillingCard({ embedded = false }: BillingCardProps) {
  const { data: billing, isLoading, isError } = useSettingsBilling()

  if (isLoading) {
    const skeletonContent = (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-20 w-full rounded-lg sm:w-48" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-pill sm:w-40" />
      </div>
    )
    if (embedded) return <div className="animate-fade-in">{skeletonContent}</div>
    return (
      <Card className="rounded-xl border border-border shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>{skeletonContent}</CardContent>
      </Card>
    )
  }

  if (isError) {
    const errorContent = (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-muted/30 p-8 text-center"
        role="alert"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">Unable to load billing</p>
          <p className="text-sm text-muted-foreground">
            Please try again later or contact support.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
    if (embedded) return <div className="animate-fade-in">{errorContent}</div>
    return (
      <Card className="rounded-xl border border-border shadow-card">
        <CardContent className="pt-6">{errorContent}</CardContent>
      </Card>
    )
  }

  const plan = billing?.plan ?? 'Starter'
  const nextBilling = billing?.nextBillingDate
  const invoices = billing?.invoices ?? []
  const paymentMethod = billing?.paymentMethod

  const mainContent = (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-lg border border-border bg-secondary/30 p-4 shadow-sm">
          <p className="font-semibold text-foreground">{plan}</p>
          {nextBilling ? (
            <p className="text-sm text-muted-foreground">
              Next billing: {new Date(nextBilling).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming billing</p>
          )}
        </div>
        <Badge variant="secondary" className="w-fit rounded-full">
          Active
        </Badge>
      </div>

      {paymentMethod ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Payment method</p>
          <p className="text-sm text-muted-foreground">
            {paymentMethod.brand} •••• {paymentMethod.last4}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
          <p className="text-sm text-muted-foreground">No payment method on file</p>
        </div>
      )}

      {invoices.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Recent invoices</p>
          <ul className="space-y-1" role="list">
            {invoices.slice(0, 3).map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-muted-foreground">
                  {new Date(inv.date).toLocaleDateString()} — {inv.currency} {inv.amount}
                </span>
                <Badge
                  variant={inv.status === 'paid' ? 'secondary' : 'outline'}
                  className={cn(
                    'w-fit rounded-full',
                    inv.status === 'paid' && 'bg-success/20 text-success',
                    inv.status === 'failed' && 'bg-destructive/20 text-destructive'
                  )}
                >
                  {inv.status}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center"
          role="status"
        >
          <Receipt className="h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">No invoices yet</p>
          <p className="text-xs text-muted-foreground">
            Invoices will appear here after your first billing cycle.
          </p>
        </div>
      )}

      <Button asChild className="w-full sm:w-auto">
        <Link to="/dashboard/billing" className="inline-flex items-center gap-2">
          <FileText className="h-4 w-4" aria-hidden />
          Manage billing
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  )

  if (embedded) {
    return mainContent
  }

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" aria-hidden />
          <CardTitle>Billing & subscription</CardTitle>
        </div>
        <CardDescription>
          Plan, renewal, invoices, payment methods, and usage metrics
        </CardDescription>
      </CardHeader>
      <CardContent>{mainContent}</CardContent>
    </Card>
  )
}
