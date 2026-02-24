import { Link } from 'react-router-dom'
import { CreditCard, FileText, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSettingsBilling } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function BillingCard() {
  const { data: billing, isLoading } = useSettingsBilling()

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-border shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  const plan = billing?.plan ?? 'Starter'
  const nextBilling = billing?.nextBillingDate
  const invoices = billing?.invoices ?? []
  const paymentMethod = billing?.paymentMethod

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <CardTitle>Billing & subscription</CardTitle>
        </div>
        <CardDescription>
          Plan, renewal, invoices, payment methods, and usage metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="font-semibold text-foreground">{plan}</p>
            {nextBilling && (
              <p className="text-sm text-muted-foreground">
                Next billing: {new Date(nextBilling).toLocaleDateString()}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="w-fit">Active</Badge>
        </div>

        {paymentMethod && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Payment method</p>
            <p className="text-sm text-muted-foreground">
              {paymentMethod.brand} •••• {paymentMethod.last4}
            </p>
          </div>
        )}

        {invoices.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent invoices</p>
            <ul className="space-y-1">
              {invoices.slice(0, 3).map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">
                    {new Date(inv.date).toLocaleDateString()} — {inv.currency} {inv.amount}
                  </span>
                  <Badge
                    variant={inv.status === 'paid' ? 'secondary' : 'outline'}
                    className={cn(
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
        )}

        <Button asChild className="w-full sm:w-auto">
          <Link to="/dashboard/billing" className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manage billing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
