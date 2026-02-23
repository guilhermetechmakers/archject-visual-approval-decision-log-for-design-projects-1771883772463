import * as React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement } from '@stripe/react-stripe-js'
import { CreditCard, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

interface PaymentMethodCardProps {
  clientSecret: string | null
  onCardComplete?: (complete: boolean) => void
  disabled?: boolean
  className?: string
}

function MockCardInput({
  onComplete,
  disabled,
}: {
  onComplete: (complete: boolean) => void
  disabled?: boolean
}) {
  const [cardNumber, setCardNumber] = React.useState('')
  const [expiry, setExpiry] = React.useState('')
  const [cvc, setCvc] = React.useState('')

  React.useEffect(() => {
    const complete =
      /^\d{13,19}$/.test(cardNumber.replace(/\s/g, '')) &&
      /^\d{2}\/\d{2}$/.test(expiry) &&
      /^\d{3,4}$/.test(cvc)
    onComplete(complete)
  }, [cardNumber, expiry, cvc, onComplete])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Card number</label>
        <Input
          placeholder="4242 4242 4242 4242"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 19))}
          maxLength={19}
          disabled={disabled}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Expiry (MM/YY)</label>
          <Input
            placeholder="12/34"
            value={expiry}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4)
              if (v.length >= 2) setExpiry(`${v.slice(0, 2)}/${v.slice(2)}`)
              else setExpiry(v)
            }}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">CVC</label>
          <Input
            placeholder="123"
            type="password"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}

function StripePaymentForm({ onComplete }: { onComplete: (complete: boolean) => void }) {
  React.useEffect(() => onComplete(true), [onComplete])
  return <PaymentElement onReady={() => onComplete(true)} />
}

export function PaymentMethodCard({
  clientSecret,
  onCardComplete,
  disabled = false,
  className,
}: PaymentMethodCardProps) {
  const useMock = !stripePromise || clientSecret?.startsWith('pi_mock_')

  const handleComplete = React.useCallback(
    (complete: boolean) => onCardComplete?.(complete),
    [onCardComplete]
  )

  if (!clientSecret) {
    return (
      <Card
        className={cn(
          'rounded-2xl border border-border bg-card shadow-card',
          className
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Payment method</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-12">
            <p className="text-sm text-muted-foreground">
              Enter billing information to continue
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const cardContent = useMock ? (
    <MockCardInput onComplete={handleComplete} disabled={disabled} />
  ) : stripePromise ? (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentForm onComplete={handleComplete} />
    </Elements>
  ) : (
    <MockCardInput onComplete={handleComplete} disabled={disabled} />
  )

  return (
    <Card
      className={cn(
        'rounded-2xl border border-border bg-card shadow-card transition-all duration-200',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Payment method</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Your payment information is encrypted and secure
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {cardContent}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          <span>
            {useMock
              ? 'Demo mode: use 4242 4242 4242 4242 for test.'
              : 'Secured by Stripe. We never store your card details.'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
