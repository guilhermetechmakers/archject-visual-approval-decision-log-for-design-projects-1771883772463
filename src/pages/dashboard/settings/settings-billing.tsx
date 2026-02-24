import { CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BillingCard } from '@/components/settings'
import { cn } from '@/lib/utils'

export function SettingsBilling() {
  return (
    <Card
      className={cn(
        'rounded-xl border border-border bg-card shadow-card',
        'transition-all duration-200 hover:shadow-card-hover',
        'animate-fade-in'
      )}
    >
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Billing
            </CardTitle>
            <CardDescription className="mt-1">
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
