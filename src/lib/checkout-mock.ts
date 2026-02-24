/**
 * Mock checkout data for when API is unavailable
 */

import type {
  CreatePaymentIntentResponse,
  ConfirmPaymentResponse,
  ApplyCouponResponse,
  CreateInvoiceResponse,
  CheckoutSummary,
} from '@/types/checkout'
import { MOCK_PLANS, MOCK_ADDONS } from '@/lib/billing-mock'

const MOCK_COUPONS: Record<string, { type: 'percent' | 'fixed'; value: number }> = {
  WELCOME10: { type: 'percent', value: 10 },
  SAVE20: { type: 'fixed', value: 20 },
  TRIAL50: { type: 'percent', value: 50 },
}

export function getMockPaymentIntent(
  planId?: string,
  addonIds?: string[],
  couponCode?: string
): CreatePaymentIntentResponse {
  const plan = planId ? MOCK_PLANS.find((p) => p.id === planId) : MOCK_PLANS[0]
  const addons = (addonIds ?? []).map((id) => MOCK_ADDONS.find((a) => a.id === id)).filter(Boolean)
  const baseAmount = (plan?.price ?? 29) + addons.reduce((s, a) => s + (a?.price ?? 0), 0)
  const taxAmount = Math.round(baseAmount * 0.08 * 100) / 100
  let discountAmount = 0
  if (couponCode) {
    const c = MOCK_COUPONS[couponCode.toUpperCase()]
    if (c) {
      discountAmount = c.type === 'percent' ? (baseAmount * c.value) / 100 : c.value
    }
  }
  const total = Math.max(0, baseAmount + taxAmount - discountAmount)
  return {
    clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`,
    paymentIntentId: `pi_mock_${Date.now()}`,
    amount: Math.round(total * 100),
    currency: 'usd',
    taxAmount: Math.round(taxAmount * 100),
    prorations: [],
    discount:
      discountAmount > 0 && couponCode
        ? { amount: Math.round(discountAmount * 100), code: couponCode }
        : undefined,
  }
}

export function getMockConfirmPayment(): ConfirmPaymentResponse {
  return {
    success: true,
    orderId: `ord_${Date.now()}`,
    subscriptionId: `sub_${Date.now()}`,
    nextStep: 'billing',
  }
}

export function getMockApplyCoupon(
  code: string,
  planId?: string,
  addonIds?: string[]
): ApplyCouponResponse {
  const coupon = MOCK_COUPONS[code.toUpperCase()]
  if (!coupon) {
    return { valid: false, message: 'Invalid or expired coupon code' }
  }
  const plan = planId ? MOCK_PLANS.find((p) => p.id === planId) : MOCK_PLANS[0]
  const addons = (addonIds ?? []).map((id) => MOCK_ADDONS.find((a) => a.id === id)).filter(Boolean)
  const baseAmount = (plan?.price ?? 29) + addons.reduce((s, a) => s + (a?.price ?? 0), 0)
  const discountAmount =
    coupon.type === 'percent' ? (baseAmount * coupon.value) / 100 : coupon.value
  const taxAmount = Math.round((baseAmount - discountAmount) * 0.08 * 100) / 100
  const newTotal = Math.max(0, baseAmount - discountAmount + taxAmount)
  return {
    valid: true,
    newTotal,
    discountDetails: {
      amount: discountAmount,
      code,
      type: coupon.type,
    },
  }
}

export function getMockCreateInvoice(): CreateInvoiceResponse {
  return {
    invoiceId: `inv_${Date.now()}`,
    invoiceUrl: '/invoices/invoice.pdf',
  }
}


export function getMockCheckoutSummary(
  planId?: string,
  addonIds?: string[],
  seats = 1,
  couponCode?: string
): CheckoutSummary {
  const plan = planId ? MOCK_PLANS.find((p) => p.id === planId) : MOCK_PLANS[0]
  const addons = (addonIds ?? []).map((id) => MOCK_ADDONS.find((a) => a.id === id)).filter(Boolean)
  const lineItems: CheckoutSummary['lineItems'] = []
  if (plan) {
    lineItems.push({
      id: plan.id,
      description: `${plan.name} (${plan.interval === 'yearly' ? 'Annual' : 'Monthly'})`,
      amount: plan.price * seats,
      quantity: seats,
      type: 'plan',
    })
  }
  addons.forEach((a) => {
    if (a) {
      lineItems.push({
        id: a.id,
        description: a.name,
        amount: a.price,
        quantity: 1,
        type: 'addon',
      })
    }
  })
  const subtotal = lineItems.reduce((s, i) => s + i.amount * (i.quantity ?? 1), 0)
  const coupon = couponCode ? MOCK_COUPONS[couponCode.toUpperCase()] : null
  const discountAmount = coupon
    ? coupon.type === 'percent'
      ? (subtotal * coupon.value) / 100
      : coupon.value
    : 0
  const afterDiscount = Math.max(0, subtotal - discountAmount)
  const taxAmount = Math.round(afterDiscount * 0.08 * 100) / 100
  if (discountAmount > 0 && couponCode) {
    lineItems.push({
      id: 'discount',
      description: `Coupon: ${couponCode}`,
      amount: -discountAmount,
      type: 'discount',
    })
  }
  lineItems.push({
    id: 'tax',
    description: 'Tax (8%)',
    amount: taxAmount,
    type: 'tax',
  })
  const total = afterDiscount + taxAmount
  return {
    lineItems,
    subtotal,
    taxAmount,
    discountAmount,
    total,
    currency: 'USD',
  }
}
