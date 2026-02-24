/**
 * Billing React Query hooks with API + mock fallback
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billingApi, type InvoicesParams } from '@/api/billing'
import {
  MOCK_SUBSCRIPTION,
  MOCK_ADDONS,
  MOCK_PLANS,
  getMockInvoicesResponse,
} from '@/lib/billing-mock'
import { toast } from 'sonner'

const BILLING_KEYS = ['billing'] as const

async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export function useBillingSubscription() {
  return useQuery({
    queryKey: [...BILLING_KEYS, 'subscription'],
    queryFn: () =>
      withFallback(() => billingApi.getSubscription(), MOCK_SUBSCRIPTION),
  })
}

export function useBillingInvoices(params?: InvoicesParams) {
  return useQuery({
    queryKey: [...BILLING_KEYS, 'invoices', params],
    queryFn: () =>
      withFallback(
        () => billingApi.getInvoices(params),
        getMockInvoicesResponse(params)
      ),
  })
}

export function useBillingPlans() {
  return useQuery({
    queryKey: [...BILLING_KEYS, 'plans'],
    queryFn: () =>
      withFallback(() => billingApi.getPlans(), MOCK_PLANS),
  })
}

export function useBillingAddOns() {
  return useQuery({
    queryKey: [...BILLING_KEYS, 'addons'],
    queryFn: () => withFallback(() => billingApi.getAddOns(), MOCK_ADDONS),
  })
}

export function useChangePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: billingApi.changePlan,
    onSuccess: (data) => {
      if (data?.success) {
        qc.invalidateQueries({ queryKey: [...BILLING_KEYS, 'subscription'] })
        toast.success('Plan updated successfully')
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to change plan')
    },
  })
}

export function useConfirmPlanChange() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { plan_id: string; interval?: 'monthly' | 'yearly' }) =>
      billingApi.changePlan(data as Parameters<typeof billingApi.changePlan>[0]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...BILLING_KEYS, 'subscription'] })
      toast.success('Plan updated successfully')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to change plan')
    },
  })
}

export function useCreateSetupIntent() {
  return useMutation({
    mutationFn: () => billingApi.createSetupIntent(),
  })
}

export function useAddPaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      billingApi.addPaymentMethod({ payment_method_id: paymentMethodId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...BILLING_KEYS, 'subscription'] })
      toast.success('Payment method added')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to add payment method')
    },
  })
}

export function useSetDefaultPaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: billingApi.setDefaultPaymentMethod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...BILLING_KEYS, 'subscription'] })
      toast.success('Default payment method updated')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to update payment method')
    },
  })
}

export function useRemovePaymentMethod() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: billingApi.removePaymentMethod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...BILLING_KEYS, 'subscription'] })
      toast.success('Payment method removed')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to remove payment method')
    },
  })
}

export function usePurchaseAddOn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ addOnId, quantity }: { addOnId: string; quantity?: number }) =>
      billingApi.purchaseAddOn({ addon_id: addOnId, quantity }),
    onSuccess: (data) => {
      if (data?.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        qc.invalidateQueries({ queryKey: [...BILLING_KEYS] })
        toast.success('Add-on purchased successfully')
      }
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to purchase add-on')
    },
  })
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: (variables: { code: string }) => billingApi.applyCoupon(variables),
    onSuccess: (data) => {
      if (data?.success) {
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

export function useExportBilling() {
  return useMutation({
    mutationFn: (format: 'pdf' | 'csv' | 'json') => billingApi.exportBilling(format),
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Export failed')
    },
  })
}

export function useBillingRefund() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      charge_id?: string
      payment_intent_id?: string
      amount?: number
      reason?: string
    }) => billingApi.refund(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...BILLING_KEYS] })
      toast.success('Refund initiated')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Refund failed')
    },
  })
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: (data: {
      type: 'subscription' | 'addon'
      plan_id?: string
      addon_id?: string
      success_url?: string
      cancel_url?: string
    }) => billingApi.createCheckoutSession(data),
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Checkout failed')
    },
  })
}
