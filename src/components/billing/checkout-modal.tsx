import { useState } from 'react'
import { Loader2, Tag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePurchaseAddOn, useApplyCoupon } from '@/hooks/use-billing'
import { toast } from 'sonner'
import type { BillingAddOn } from '@/types/billing'

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addon: BillingAddOn
}

export function CheckoutModal({
  open,
  onOpenChange,
  addon,
}: CheckoutModalProps) {
  const [couponCode, setCouponCode] = useState('')
  const purchaseAddOn = usePurchaseAddOn()
  const applyCoupon = useApplyCoupon()

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return
    applyCoupon.mutate({ code: couponCode.trim() })
  }

  const handleCheckout = () => {
    purchaseAddOn.mutate(
      { addOnId: addon.id, quantity: 1 },
      {
        onSuccess: (data) => {
          if (data?.checkout_url) {
            window.location.href = data.checkout_url
          } else {
            onOpenChange(false)
          }
        },
        onError: () => {
          toast.success('Add-on purchase initiated. Complete payment in Stripe Checkout when backend is configured.')
          onOpenChange(false)
        },
      }
    )
  }

  const intervalLabel =
    addon.interval === 'monthly'
      ? '/mo'
      : addon.interval === 'yearly'
        ? '/yr'
        : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showClose>
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Review your order and complete payment securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="font-semibold">{addon.name}</p>
            <p className="text-sm text-muted-foreground">{addon.description}</p>
            <p className="mt-2 text-lg font-bold">
              ${addon.price}
              {intervalLabel}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coupon">Coupon code</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                placeholder="Enter code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || applyCoupon.isPending}
                aria-label="Apply coupon"
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={purchaseAddOn.isPending}
          >
            {purchaseAddOn.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              'Proceed to payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
