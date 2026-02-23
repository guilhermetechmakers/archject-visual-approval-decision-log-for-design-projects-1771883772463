import { DollarSign, TrendingUp, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useBillingSummary } from '@/hooks/use-billing-history'

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount)
}

export function SummaryCards() {
  const { data, isLoading } = useBillingSummary()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    )
  }

  const summary = data ?? {
    total_paid: 0,
    total_outstanding: 0,
    total_refunds: 0,
    currency: 'USD',
  }

  const cards = [
    {
      title: 'Total paid',
      value: formatCurrency(summary.total_paid, summary.currency),
      icon: DollarSign,
      className: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20',
    },
    {
      title: 'Outstanding',
      value: formatCurrency(summary.total_outstanding, summary.currency),
      icon: TrendingUp,
      className: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
    },
    {
      title: 'Total refunds',
      value: formatCurrency(summary.total_refunds, summary.currency),
      icon: RotateCcw,
      className: 'bg-gradient-to-br from-secondary to-secondary/50 border-border',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={cn(
            'rounded-2xl border shadow-card transition-all duration-200 hover:shadow-card-hover',
            card.className
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
