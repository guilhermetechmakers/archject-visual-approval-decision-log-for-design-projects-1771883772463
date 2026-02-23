import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'
import { ValidationMessages } from './validation-messages'

export interface PaymentMethodFormProps {
  onSuccess?: (paymentMethodId: string) => void
  onError?: (message: string) => void
  disabled?: boolean
}

export function PaymentMethodForm({
  onSuccess,
  onError,
  disabled,
}: PaymentMethodFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsLoading(true)
    setError(null)
    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message ?? 'Card validation failed')
        onError?.(submitError.message ?? 'Card validation failed')
        return
      }
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/billing`,
          receipt_email: undefined,
        },
      })
      if (result.error) {
        setError(result.error.message ?? 'Payment failed')
        onError?.(result.error.message ?? 'Payment failed')
        return
      }
      const pi = (result as { paymentIntent?: { status?: string; payment_method?: string }; error?: unknown }).paymentIntent
      if (pi?.status === 'succeeded' && pi.payment_method) {
        onSuccess?.(String(pi.payment_method))
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      setError(msg)
      onError?.(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'never', googlePay: 'never' },
        }}
        onChange={() => {
          setError(null)
        }}
      />
      <ValidationMessages status="error" message={error ?? undefined} />
      <button
        type="submit"
        disabled={!stripe || !elements || isLoading || disabled}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          'Pay now'
        )}
      </button>
    </form>
  )
}
