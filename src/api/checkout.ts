/**
 * Checkout API - Payment Intent, coupon, invoice
 */

import { api } from '@/lib/api'
import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  ApplyCouponRequest,
  ApplyCouponResponse,
  CreateInvoiceRequest,
  CreateInvoiceResponse,
} from '@/types/checkout'

export const checkoutApi = {
  createPaymentIntent: (data: CreatePaymentIntentRequest) =>
    api.post<CreatePaymentIntentResponse>('/checkout/create-payment-intent', data),

  confirmPayment: (data: ConfirmPaymentRequest) =>
    api.post<ConfirmPaymentResponse>('/checkout/confirm-payment', data),

  applyCoupon: (data: ApplyCouponRequest) =>
    api.post<ApplyCouponResponse>('/checkout/apply-coupon', data),

  createInvoice: (data: CreateInvoiceRequest) =>
    api.post<CreateInvoiceResponse>('/invoices/create', data),

  updateBillingMethod: (data: {
    customerId: string
    paymentMethodId?: string
    invoicePreferred?: boolean
  }) =>
    api.patch<{ success: boolean }>('/billing/update-method', data),
}
