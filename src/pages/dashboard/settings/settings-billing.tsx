import { CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BillingCard } from '@/components/settings'
import { cn } from '@/lib/utils'

export function SettingsBilling() {
  return (
    <Card
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-card',
        'transition-all duration-200 hover:shadow-card-hover',
        'animate-fade-in'
      )}
    >
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"
            aria-hidden
          >
            <CreditCard className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Billing
            </CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              Plan, payment method, and invoices
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <BillingCard embedded />
      </CardContent>
    </Card>
  )
}
