/**
 * Checkout React Query hooks with API + mock fallback
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkoutApi } from '@/api/checkout'
import {
  getMockPaymentIntent,
  getMockConfirmPayment,
  getMockApplyCoupon,
  getMockCreateInvoice,
  getMockCheckoutSummary,
} from '@/lib/checkout-mock'
import type {
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  ApplyCouponRequest,
  CreateInvoiceRequest,
} from '@/types/checkout'
import { toast } from 'sonner'

const BILLING_KEYS = ['billing'] as const

async function withFallback<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback()
  }
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: CreatePaymentIntentRequest) =>
      withFallback(
        () => checkoutApi.createPaymentIntent(data),
        () =>
          getMockPaymentIntent(
            data.planId,
            data.addonIds,
            data.couponCode
          )
      ),
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to create payment session')
    },
  })
}

export function useConfirmPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ConfirmPaymentRequest) =>
      withFallback(
        () => checkoutApi.confirmPayment(data),
        () => getMockConfirmPayment()
      ),
    onSuccess: (data) => {
      if (data?.success) {
        qc.invalidateQueries({ queryKey: [...BILLING_KEYS] })
        toast.success('Payment successful')
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Payment failed')
    },
  })
}

export function useApplyCheckoutCoupon() {
  return useMutation({
    mutationFn: (data: ApplyCouponRequest) =>
      withFallback(
        () => checkoutApi.applyCoupon(data),
        () =>
          getMockApplyCoupon(data.couponCode, data.planId, data.addonIds)
      ),
    onSuccess: (data) => {
      if (data?.valid) {
        toast.success('Coupon applied')
      } else {
        toast.error(data?.message ?? 'Invalid or expired coupon')
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to apply coupon')
    },
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateInvoiceRequest) =>
      withFallback(
        () => checkoutApi.createInvoice(data),
        () => getMockCreateInvoice()
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...BILLING_KEYS] })
      toast.success('Invoice created successfully')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to create invoice')
    },
  })
}

export function useCheckoutSummary(params: {
  planId?: string
  addonIds?: string[]
  seats?: number
  couponCode?: string
}) {
  return getMockCheckoutSummary(
    params.planId,
    params.addonIds,
    params.seats ?? 1,
    params.couponCode
  )
}
