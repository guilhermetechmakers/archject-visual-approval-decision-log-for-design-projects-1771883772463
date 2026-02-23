import * as React from 'react'
import { ChevronDown, ChevronUp, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CheckoutSummary } from '@/types/checkout'

interface OrderSummaryCardProps {
  summary: CheckoutSummary
  className?: string
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'usd' ? 'USD' : currency,
  }).format(amount)
}

export function OrderSummaryCard({ summary, className }: OrderSummaryCardProps) {
  const hasManyItems = summary.lineItems.length > 6

  return (
    <Card
      className={cn(
        'rounded-2xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Order summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <OrderSummaryLines
          items={summary.lineItems}
          expandable={hasManyItems}
          currency={summary.currency}
        />
        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatAmount(summary.subtotal, summary.currency)}</span>
          </div>
          {summary.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Discount</span>
              <span>-{formatAmount(summary.discountAmount, summary.currency)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">{formatAmount(summary.taxAmount, summary.currency)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-2">
            <span>Total</span>
            <span className="text-primary">{formatAmount(summary.total, summary.currency)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrderSummaryLines({
  items,
  expandable,
  currency,
}: {
  items: CheckoutSummary['lineItems']
  expandable: boolean
  currency: string
}) {
  const [expanded, setExpanded] = React.useState(!expandable)
  const displayItems = expanded ? items : items.slice(0, 4)

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex justify-between text-sm',
              item.type === 'discount' && 'text-success'
            )}
          >
            <span className="text-muted-foreground">
              {item.description}
              {item.quantity ? ` × ${item.quantity}` : ''}
            </span>
            <span className={cn('font-medium', item.amount < 0 && 'text-success')}>
              {item.amount < 0 ? '-' : ''}
              {formatAmount(Math.abs(item.amount), currency)}
            </span>
          </div>
        ))}
        {expandable && !expanded && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded(true)}
          >
            <ChevronDown className="h-4 w-4" />
            Show {items.length - 4} more
          </Button>
        )}
        {expandable && expanded && items.length > 4 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded(false)}
          >
            <ChevronUp className="h-4 w-4" />
            Show less
          </Button>
        )}
      </div>
    </div>
  )
}
