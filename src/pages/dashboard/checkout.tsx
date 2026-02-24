import { useRef, useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, CreditCard, ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  OrderSummaryCard,
  BillingInfoForm,
  CouponCodeField,
  PaymentMethodCard,
  InvoiceOptionPanel,
  SummaryActions,
} from '@/components/checkout'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useBillingPlans, useBillingAddOns } from '@/hooks/use-billing'
import {
  useCheckoutSummary,
  useCreatePaymentIntent,
  useConfirmPayment,
  useApplyCheckoutCoupon,
  useCreateInvoice,
} from '@/hooks/use-checkout'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { BillingInfoFormHandle } from '@/components/checkout'

function CheckoutLoadingState() {
  return (
    <div className="animate-fade-in space-y-8" role="status" aria-label="Loading checkout">
      <div className="mb-6">
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full mt-4" />
            </div>
          </Card>
        </div>
        <div className="space-y-6 lg:col-span-3">
          <Card className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
          <Card className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function CheckoutErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Card
      className="border border-destructive/30 bg-destructive/5"
      role="alert"
      aria-label="Checkout error"
    >
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
        </div>
        <h2 className="mt-6 text-lg font-semibold text-foreground">
          Unable to load checkout
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
        <Button
          variant="outline"
          size="lg"
          className="mt-6 rounded-pill"
          onClick={onRetry}
          aria-label="Try again"
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
          Try again
        </Button>
        <Button variant="ghost" size="sm" className="mt-4" asChild>
          <Link to="/dashboard/billing" className="text-muted-foreground hover:text-foreground">
            Back to Billing
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function CheckoutEmptyState() {
  return (
    <Card
      className="border border-border border-dashed bg-card shadow-card"
      role="status"
      aria-label="No billing plans available"
    >
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-7 w-7 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="mt-6 text-lg font-semibold text-foreground">
          No billing plans available
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          There are no billing plans or add-ons available at the moment. Please contact support or
          return to the billing page to manage your subscription.
        </p>
        <Button variant="default" size="lg" className="mt-6 rounded-pill" asChild>
          <Link to="/dashboard/billing">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to Billing
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function CheckoutInvalidSelectionState({ onBack }: { onBack: () => void }) {
  return (
    <Card
      className="border border-warning/50 bg-warning/5"
      role="alert"
      aria-label="Selected plan or add-on unavailable"
    >
      <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-warning/20">
          <AlertCircle className="h-7 w-7 text-foreground" aria-hidden />
        </div>
        <h2 className="mt-6 text-lg font-semibold text-foreground">
          Selected plan or add-on unavailable
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The plan or add-on you selected is no longer available. Please choose a different option
          from the billing page.
        </p>
        <Button variant="default" size="lg" className="mt-6 rounded-pill" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Back to Billing
        </Button>
      </CardContent>
    </Card>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planId = searchParams.get('plan') ?? undefined
  const addonIds = searchParams.get('addons')?.split(',').filter(Boolean) ?? []

  const billingFormRef = useRef<BillingInfoFormHandle>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'invoice'>('card')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
  } | null>(null)

  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans,
  } = useBillingPlans()
  const {
    data: addons,
    isLoading: addonsLoading,
    isError: addonsError,
    refetch: refetchAddons,
  } = useBillingAddOns()

  const createPaymentIntent = useCreatePaymentIntent()
  const confirmPayment = useConfirmPayment()
  const applyCoupon = useApplyCheckoutCoupon()
  const createInvoice = useCreateInvoice()

  const summary = useCheckoutSummary({
    planId: planId ?? undefined,
    addonIds: addonIds.length ? addonIds : undefined,
    seats: 1,
    couponCode: appliedCoupon?.code,
  })

  const isLoading = plansLoading || addonsLoading
  const hasError = plansError || addonsError
  const plansList = plans ?? []
  const addonsList = addons ?? []
  const isEmpty = !isLoading && !hasError && plansList.length === 0 && addonsList.length === 0

  const selectedPlan = planId ? plansList.find((p) => p.id === planId) : plansList[0]
  const selectedAddons = addonIds
    .map((id) => addonsList.find((a) => a.id === id))
    .filter(Boolean)
  const hasValidSelection =
    (planId ? !!selectedPlan : plansList.length > 0) &&
    (addonIds.length === 0 || selectedAddons.length === addonIds.length)
  const hasSelectionButInvalid =
    (planId || addonIds.length > 0) && !hasValidSelection && !isEmpty

  useEffect(() => {
    if (plans && addons && !planId && addonIds.length === 0) {
      navigate('/dashboard/billing')
    }
  }, [plans, addons, planId, addonIds.length, navigate])

  useEffect(() => {
    if (!planId && addonIds.length === 0) return
    createPaymentIntent.mutate(
      {
        planId: planId ?? '',
        addonIds: addonIds.length ? addonIds : undefined,
        couponCode: appliedCoupon?.code,
      },
      {
        onSuccess: (data) => {
          if (data?.clientSecret) {
            setClientSecret(data.clientSecret)
            setPaymentIntentId(data.paymentIntentId ?? null)
          }
        },
      }
    )
  }, [planId, addonIds.join(','), appliedCoupon?.code, createPaymentIntent])

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return
    applyCoupon.mutate(
      {
        couponCode: couponCode.trim(),
        planId: planId ?? undefined,
        addonIds: addonIds.length ? addonIds : undefined,
      },
      {
        onSuccess: (data) => {
          if (data?.valid && data?.discountDetails) {
            setAppliedCoupon({
              code: data.discountDetails.code,
              discountAmount: data.discountDetails.amount ?? 0,
            })
          } else {
            setAppliedCoupon(null)
          }
        },
      }
    )
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
  }

  const handlePayNow = async () => {
    const billingInfo = billingFormRef.current?.getValues()
    const valid = await billingFormRef.current?.validate()

    if (!valid || !billingInfo) {
      billingFormRef.current?.scrollToFirstError()
      toast.error('Please fill in all required billing information')
      return
    }

    if (paymentMethod === 'invoice') {
      createInvoice.mutate(
        {
          billingInfo: {
            company: billingInfo.company,
            vat_tax_id: billingInfo.vat_tax_id,
            address: billingInfo.address,
            email: billingInfo.email,
          },
        },
        {
          onSuccess: () => {
            redirectToSuccessPage('invoice_created')
          },
        }
      )
      return
    }

    if (!cardComplete && !clientSecret?.startsWith('pi_mock_')) {
      toast.error('Please enter your card details')
      return
    }

    const paymentMethodId = 'pm_mock'
    confirmPayment.mutate(
      {
        paymentIntentId: paymentIntentId ?? 'pi_mock',
        paymentMethodId,
        savePaymentMethod: true,
      },
      {
        onSuccess: () => {
          redirectToSuccessPage('payment_completed')
        },
      }
    )
  }

  const handleRequestInvoice = () => {
    setPaymentMethod('invoice')
  }

  const redirectToSuccessPage = (type: 'payment_completed' | 'invoice_created') => {
    const params = new URLSearchParams({
      type,
      redirect: '/dashboard/billing',
      tip: 'Go to Billing to manage your subscription, view invoices, and update payment methods.',
    })
    navigate(`/dashboard/success?${params.toString()}`)
  }

  const handleRetry = () => {
    refetchPlans()
    refetchAddons()
  }

  const handleBackToBilling = () => {
    navigate('/dashboard/billing')
  }

  const couponStatus =
    applyCoupon.isPending ? 'loading'
    : applyCoupon?.data?.valid ? 'valid'
    : applyCoupon?.data?.valid === false ? 'invalid'
    : 'idle'

  const isPayDisabled =
    createPaymentIntent.isPending ||
    confirmPayment.isPending ||
    createInvoice.isPending ||
    (paymentMethod === 'card' && !cardComplete && !clientSecret?.startsWith('pi_mock_'))

  if (isLoading) {
    return <CheckoutLoadingState />
  }

  if (hasError) {
    return (
      <div className="animate-fade-in">
        <CheckoutErrorState
          message="We couldn't load billing plans. Please check your connection and try again."
          onRetry={handleRetry}
        />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="animate-fade-in">
        <CheckoutEmptyState />
      </div>
    )
  }

  if (hasSelectionButInvalid) {
    return (
      <div className="animate-fade-in">
        <CheckoutInvalidSelectionState onBack={handleBackToBilling} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild aria-label="Return to billing page">
          <Link to="/dashboard/billing" className="gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Billing
          </Link>
        </Button>
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-muted-foreground">
          Complete your subscription securely. Review your order and enter payment details.
        </p>
      </header>

      {createPaymentIntent.isError && (
        <div
          className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Unable to initialize payment
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {createPaymentIntent.error?.message ?? 'Please try again or contact support.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                createPaymentIntent.mutate({
                  planId: planId ?? '',
                  addonIds: addonIds.length ? addonIds : undefined,
                  couponCode: appliedCoupon?.code,
                })
              }
            >
              <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden />
              Retry
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <section className="lg:col-span-2" aria-labelledby="order-summary-heading">
          <h2 id="order-summary-heading" className="sr-only">
            Order summary
          </h2>
          <OrderSummaryCard summary={summary} />
        </section>

        <div className="space-y-6 lg:col-span-3">
          <BillingInfoForm ref={billingFormRef} />

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <CouponCodeField
              value={couponCode}
              onChange={setCouponCode}
              onApply={handleApplyCoupon}
              status={couponStatus}
              appliedCode={appliedCoupon?.code}
              discountAmount={appliedCoupon?.discountAmount}
              onRemove={handleRemoveCoupon}
              disabled={applyCoupon.isPending}
              message={
                applyCoupon.data?.valid === false
                  ? (applyCoupon.data?.message ?? 'Invalid or expired coupon code. Please try again.')
                  : undefined
              }
            />
          </div>

          <section
            className="space-y-4"
            role="group"
            aria-labelledby="payment-method-heading"
          >
            <h2
              id="payment-method-heading"
              className="text-sm font-medium text-foreground"
            >
              Payment method
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  paymentMethod === 'card'
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border-2 border-border hover:border-primary/50'
                )}
                onClick={() => setPaymentMethod('card')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setPaymentMethod('card')
                  }
                }}
                aria-pressed={paymentMethod === 'card'}
                aria-label="Pay with credit or debit card"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Pay with card</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Pay securely with your credit or debit card
                  </p>
                </CardContent>
              </Card>
              <InvoiceOptionPanel
                selected={paymentMethod === 'invoice'}
                onSelect={handleRequestInvoice}
              />
            </div>
          </section>

          {paymentMethod === 'card' &&
            (createPaymentIntent.isPending ? (
              <Card className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <PaymentMethodCard
                clientSecret={clientSecret}
                onCardComplete={setCardComplete}
                disabled={confirmPayment.isPending}
              />
            ))}

          <Card className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <SummaryActions
              primaryLabel={paymentMethod === 'card' ? 'Pay now' : 'Request invoice'}
              onPrimaryClick={handlePayNow}
              primaryLoading={
                confirmPayment.isPending || createInvoice.isPending
              }
              primaryDisabled={isPayDisabled}
              secondaryLabel={
                paymentMethod === 'card' ? 'Request invoice' : undefined
              }
              onSecondaryClick={
                paymentMethod === 'card' ? handleRequestInvoice : undefined
              }
              primaryAriaLabel={
                paymentMethod === 'card'
                  ? 'Pay now with card'
                  : 'Request invoice for payment'
              }
              loadingAriaLabel="Processing payment, please wait"
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
