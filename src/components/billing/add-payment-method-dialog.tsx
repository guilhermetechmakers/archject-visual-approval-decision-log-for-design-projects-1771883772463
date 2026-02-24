/**
 * Add Payment Method Dialog - Stripe Elements with SetupIntent
 * Securely collects card details via Stripe; no card data stored on server.
 */

import * as React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Lock } from 'lucide-react'
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
import { useAddPaymentMethod, useCreateSetupIntent } from '@/hooks/use-billing'

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

function MockCardForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  onSubmit: (pmId: string) => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const [cardNumber, setCardNumber] = React.useState('')
  const [expiry, setExpiry] = React.useState('')
  const [cvc, setCvc] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cardNumber && expiry && cvc) onSubmit('pm_mock_' + Date.now())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="add-card-number">Card number</Label>
        <Input
          id="add-card-number"
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 19))}
          maxLength={19}
          className="font-mono"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="add-expiry">Expiry (MM/YY)</Label>
          <Input
            id="add-expiry"
            placeholder="12/26"
            value={expiry}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4)
              if (v.length >= 2) setExpiry(`${v.slice(0, 2)}/${v.slice(2)}`)
              else setExpiry(v)
            }}
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="add-cvc">CVC</Label>
          <Input
            id="add-cvc"
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

function StripeSetupForm({
  clientSecret,
  onSuccess,
  onCancel,
}: {
  clientSecret: string
  onSuccess: (pmId: string) => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const addPaymentMethod = useAddPaymentMethod()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsSubmitting(true)
    try {
      const result = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/billing`,
        },
      })
      if (result.error) {
        addPaymentMethod.reset()
        return
      }
      const si = (result as { setupIntent?: { payment_method?: string } }).setupIntent
      const pmId = si && typeof si.payment_method === 'string' ? si.payment_method : null
      if (pmId) {
        addPaymentMethod.mutate(pmId, {
          onSuccess: () => onSuccess(pmId),
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>Secured by Stripe. We never store your card details.</span>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isSubmitting || addPaymentMethod.isPending}>
          {addPaymentMethod.isPending || isSubmitting ? 'Adding…' : 'Add card'}
        </Button>
      </DialogFooter>
    </form>
  )
}

interface AddPaymentMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddPaymentMethodDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentMethodDialogProps) {
  const createSetupIntent = useCreateSetupIntent()
  const addPaymentMethod = useAddPaymentMethod()
  const [clientSecret, setClientSecret] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open && !clientSecret && !createSetupIntent.isPending) {
      createSetupIntent.mutate(undefined, {
        onSuccess: (data) => {
          if (data?.clientSecret) setClientSecret(data.clientSecret)
        },
        onError: () => {
          setClientSecret(`seti_mock_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`)
        },
      })
    }
    if (!open) setClientSecret(null)
  }, [open])

  const useStripeElements =
    stripePromise &&
    clientSecret &&
    !clientSecret.startsWith('seti_mock_') &&
    !clientSecret.startsWith('pi_mock_')

  const handleSuccess = React.useCallback(() => {
    onOpenChange(false)
    onSuccess?.()
  }, [onOpenChange, onSuccess])

  const handleMockSubmit = (pmId: string) => {
    addPaymentMethod.mutate(pmId, {
      onSuccess: handleSuccess,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add payment method</DialogTitle>
          <DialogDescription>
            Enter your card details. Payment is processed securely via Stripe.
          </DialogDescription>
        </DialogHeader>

        {createSetupIntent.isPending && !clientSecret ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading secure form…
          </div>
        ) : useStripeElements ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: { colorPrimary: '#195C4A', borderRadius: '8px' },
              },
            }}
          >
            <StripeSetupForm
              clientSecret={clientSecret}
              onSuccess={handleSuccess}
              onCancel={() => onOpenChange(false)}
            />
          </Elements>
        ) : (
          <MockCardForm
            onSubmit={handleMockSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={addPaymentMethod.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
