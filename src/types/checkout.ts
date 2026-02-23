/**
 * Checkout / Payment types for Archject
 */

import type { Plan, BillingAddOn } from '@/types/billing'

export interface BillingAddress {
  name: string
  line1: string
  line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
}

export interface BillingInfo {
  company?: string
  vat_tax_id?: string
  address: BillingAddress
  email: string
}

export interface CreatePaymentIntentRequest {
  customerId?: string
  planId?: string
  seats?: number
  addonIds?: string[]
  billingAddress?: BillingAddress
  couponCode?: string
  interval?: 'monthly' | 'yearly'
}

export interface CreatePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
  taxAmount?: number
  prorations?: { amount: number; description: string }[]
  discount?: { amount: number; code: string }
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string
  paymentMethodId: string
  savePaymentMethod?: boolean
}

export interface ConfirmPaymentResponse {
  success: boolean
  orderId?: string
  subscriptionId?: string
  nextStep?: string
}

export interface ApplyCouponRequest {
  couponCode: string
  planId?: string
  seats?: number
  addonIds?: string[]
}

export interface ApplyCouponResponse {
  valid: boolean
  newTotal?: number
  discountDetails?: {
    amount: number
    code: string
    type: 'percent' | 'fixed'
  }
  message?: string
}

export interface CreateInvoiceRequest {
  orderId?: string
  customerId?: string
  billingInfo: BillingInfo
}

export interface CreateInvoiceResponse {
  invoiceId: string
  invoiceUrl: string
}

export interface OrderSummaryLineItem {
  id: string
  label: string
  amount: number
  quantity?: number
}

export interface CheckoutSummaryLineItem {
  id: string
  description: string
  amount: number
  quantity?: number
  type: 'plan' | 'addon' | 'discount' | 'tax'
}

export interface CheckoutSummary {
  lineItems: CheckoutSummaryLineItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  currency: string
}

export interface CheckoutLineItem {
  id: string
  name?: string
  description?: string
  quantity?: number
  unit_price?: number
  total?: number
  type?: 'plan' | 'addon' | 'discount' | 'tax'
}

export interface OrderSummary {
  line_items: CheckoutLineItem[]
  subtotal: number
  tax_amount: number
  discount_amount: number
  total: number
  currency: string
}

export interface CheckoutState {
  plan: Plan | null
  addons: BillingAddOn[]
  seats: number
  interval: 'monthly' | 'yearly'
  subtotal: number
  prorations: { amount: number; description: string }[]
  taxAmount: number
  discount: { amount: number; code: string } | null
  total: number
  currency: string
}
