import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Check, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useBillingAddOns } from '@/hooks/use-billing'
import { CheckoutModal } from './checkout-modal'
import { cn } from '@/lib/utils'
import type { BillingAddOn } from '@/types/billing'

export function AddOnsSection() {
  const navigate = useNavigate()
  const [checkoutAddOn, setCheckoutAddOn] = useState<BillingAddOn | null>(null)
  const { data: addons, isLoading } = useBillingAddOns()

  const handleFullCheckout = (addon: BillingAddOn) => {
    navigate(`/dashboard/checkout?addons=${addon.id}`)
  }

  return (
    <>
      <Card className="rounded-2xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Add-ons</CardTitle>
              <CardDescription>
                Extend your plan with additional capabilities
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : addons && addons.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {addons.map((addon) => (
                <AddOnCard
                  key={addon.id}
                  addon={addon}
                  onPurchase={() => setCheckoutAddOn(addon)}
                  onFullCheckout={() => handleFullCheckout(addon)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium text-foreground">No add-ons available</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add-ons will appear here when they become available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {checkoutAddOn && (
        <CheckoutModal
          open={!!checkoutAddOn}
          onOpenChange={(open) => !open && setCheckoutAddOn(null)}
          addon={checkoutAddOn}
        />
      )}
    </>
  )
}

function AddOnCard({
  addon,
  onPurchase,
  onFullCheckout,
}: {
  addon: BillingAddOn
  onPurchase: () => void
  onFullCheckout: () => void
}) {
  const intervalLabel =
    addon.interval === 'monthly'
      ? '/mo'
      : addon.interval === 'yearly'
        ? '/yr'
        : ' one-time'

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-border bg-card p-4 transition-all duration-200',
        'hover:border-primary/30 hover:shadow-card'
      )}
    >
      <h4 className="font-semibold text-foreground">{addon.name}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{addon.description}</p>
      <ul className="mt-3 flex-1 space-y-1.5 text-sm text-muted-foreground">
        {addon.features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-success" />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            ${addon.price}
            <span className="text-sm font-normal text-muted-foreground">
              {intervalLabel}
            </span>
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onFullCheckout} aria-label={`Checkout ${addon.name}`}>
              Checkout
            </Button>
            <Button size="sm" onClick={onPurchase} aria-label={`Buy ${addon.name}`}>
              <ShoppingCart className="h-4 w-4" aria-hidden />
              Buy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
