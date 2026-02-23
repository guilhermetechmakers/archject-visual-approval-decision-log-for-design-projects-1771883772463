import { useState } from 'react'
import { CreditCard, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { useBillingSubscription, useAddPaymentMethod } from '@/hooks/use-billing'
import type { BillingPaymentMethod } from '@/types/billing'

/**
 * Payment method form - placeholder for Stripe Elements integration.
 * When Stripe is configured, mount CardElement in the #stripe-card-element container.
 * For now shows a simulated form for UI demonstration.
 */
function PaymentMethodForm({
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  onCancel: () => void
  onSubmit: (paymentMethodId: string) => void
  isSubmitting: boolean
}) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cardNumber && expiry && cvc) {
      onSubmit('pm_mock_' + Date.now())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-number">Card number</Label>
        <Input
          id="card-number"
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
          maxLength={19}
          className="font-mono"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry">Expiry (MM/YY)</Label>
          <Input
            id="expiry"
            placeholder="12/26"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvc">CVC</Label>
          <Input
            id="cvc"
            placeholder="123"
            type="password"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Card details are processed securely via Stripe. We never store full card numbers.
      </p>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!cardNumber || !expiry || !cvc || isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add card'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function PaymentMethodSection() {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const { data, isLoading } = useBillingSubscription()
  const addPaymentMethod = useAddPaymentMethod()
  const paymentMethod = data?.payment_method as BillingPaymentMethod | undefined

  const handleAddCard = (paymentMethodId: string) => {
    addPaymentMethod.mutate(paymentMethodId, {
      onSuccess: () => setAddModalOpen(false),
    })
  }

  return (
    <TooltipProvider>
      <Card className="rounded-2xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Payment method</CardTitle>
          </div>
          <CardDescription>
            Manage your payment methods for subscriptions and add-ons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-24 w-full rounded-xl" />
          ) : paymentMethod ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {paymentMethod.brand} •••• {paymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {String(paymentMethod.exp_month).padStart(2, '0')}/
                    {paymentMethod.exp_year}
                  </p>
                  {paymentMethod.is_default && (
                    <span className="mt-1 inline-flex items-center rounded-md bg-success/20 px-2 py-0.5 text-xs font-medium text-primary">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddModalOpen(true)}
                      className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Plus className="h-4 w-4" />
                      Update
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add or update payment method</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">No payment method</p>
              <p className="text-sm text-muted-foreground">
                Add a card to pay for your subscription and add-ons
              </p>
              <Button
                className="mt-4"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add payment method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add payment method</DialogTitle>
            <DialogDescription>
              Enter your card details. Payment is processed securely via Stripe.
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodForm
            onCancel={() => setAddModalOpen(false)}
            onSubmit={handleAddCard}
            isSubmitting={addPaymentMethod.isPending}
          />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
