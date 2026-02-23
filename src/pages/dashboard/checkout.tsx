import { useRef, useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, CreditCard } from 'lucide-react'
import {
  OrderSummaryCard,
  BillingInfoForm,
  CouponCodeField,
  PaymentMethodCard,
  InvoiceOptionPanel,
  SummaryActions,
} from '@/components/checkout'
import { OperationSuccessModal } from '@/components/client-portal/operation-success-modal'
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
import type { BillingInfoFormHandle } from '@/components/checkout'

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
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [successType, setSuccessType] = useState<'payment_completed' | 'invoice_created'>(
    'payment_completed'
  )

  const { data: plans } = useBillingPlans()
  const { data: addons } = useBillingAddOns()
  const createPaymentIntent = useCreatePaymentIntent()
  void plans
  void addons
  const confirmPayment = useConfirmPayment()
  const applyCoupon = useApplyCheckoutCoupon()
  const createInvoice = useCreateInvoice()

  const summary = useCheckoutSummary({
    planId: planId ?? undefined,
    addonIds: addonIds.length ? addonIds : undefined,
    seats: 1,
    couponCode: appliedCoupon?.code,
  })

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
            setSuccessType('invoice_created')
            setSuccessModalOpen(true)
          },
        }
      )
      return
    }

    if (!cardComplete && !clientSecret?.startsWith('pi_mock_')) {
      toast.error('Please enter your card details')
      return
    }

    confirmPayment.mutate(
      {
        paymentIntentId: paymentIntentId ?? 'pi_mock',
        paymentMethodId: 'pm_mock_' + Date.now(),
        savePaymentMethod: true,
      },
      {
        onSuccess: () => {
          setSuccessType('payment_completed')
          setSuccessModalOpen(true)
        },
      }
    )
  }

  const handleRequestInvoice = () => {
    setPaymentMethod('invoice')
  }

  const handleSuccessClose = () => {
    setSuccessModalOpen(false)
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

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/billing" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Billing
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-muted-foreground">
          Complete your subscription securely. Review your order and enter payment details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <OrderSummaryCard summary={summary} />
        </div>

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
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground">Payment method</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'card'
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border-2 border-border hover:border-primary/50'
                }`}
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
                aria-label="Pay with card"
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
          </div>

          {paymentMethod === 'card' && (
            <PaymentMethodCard
              clientSecret={clientSecret}
              onCardComplete={setCardComplete}
              disabled={confirmPayment.isPending}
            />
          )}

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
            />
          </Card>
        </div>
      </div>

      <OperationSuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        type={successType}
        title={successType === 'invoice_created' ? 'Invoice requested' : 'Payment successful'}
        description={
          successType === 'invoice_created'
            ? 'Your invoice has been created and will be sent to your email.'
            : 'Your payment was processed successfully. Thank you for your subscription.'
        }
        nextSteps="Go to Billing to manage your subscription, view invoices, and update payment methods."
        onClose={handleSuccessClose}
      />
    </div>
  )
}
