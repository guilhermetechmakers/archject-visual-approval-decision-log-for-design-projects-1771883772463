/**
 * Billing API - Subscription, invoices, payment methods, add-ons
 */

import { api } from '@/lib/api'
import type {
  BillingSubscription,
  BillingInvoice,
  BillingAddOn,
  Plan,
  PlanChangeRequest,
  PlanChangeResponse,
} from '@/types/billing'

export interface InvoicesParams {
  page?: number
  limit?: number
  status?: string
}

export interface InvoicesResponse {
  invoices: BillingInvoice[]
  total: number
  page: number
  limit: number
}

export const billingApi = {
  getSubscription: () =>
    api.get<BillingSubscription>('/billing/subscription'),

  getPlans: () => api.get<Plan[]>('/billing/plans'),

  getInvoices: (params?: InvoicesParams) => {
    const search = new URLSearchParams()
    if (params?.page != null) search.set('page', String(params.page))
    if (params?.limit != null) search.set('limit', String(params.limit))
    if (params?.status) search.set('status', params.status)
    const qs = search.toString()
    return api.get<InvoicesResponse>(`/billing/invoices${qs ? `?${qs}` : ''}`)
  },

  changePlan: (data: PlanChangeRequest) =>
    api.post<PlanChangeResponse>('/billing/change-plan', data),

  addPaymentMethod: (data: { payment_method_id: string }) =>
    api.post<{ success: boolean }>('/billing/payment-method', data),

  setDefaultPaymentMethod: (id: string) =>
    api.post<{ success: boolean }>(`/billing/payment-method/${id}/default`),

  removePaymentMethod: (id: string) =>
    api.delete<void>(`/billing/payment-method/${id}`),

  getAddOns: () =>
    api.get<BillingAddOn[]>('/billing/addons'),

  purchaseAddOn: (data: { addon_id: string; quantity?: number }) =>
    api.post<{ checkout_url?: string; session_id?: string }>('/billing/purchase-addon', data),

  applyCoupon: (data: { code: string }) =>
    api.post<{ success: boolean; message?: string }>('/billing/apply-coupon', data),

  createCheckoutSession: (data: {
    type: 'subscription' | 'addon'
    plan_id?: string
    addon_id?: string
    success_url?: string
    cancel_url?: string
  }) =>
    api.post<{ url: string; session_id: string }>('/checkout/session', data),

  exportBilling: (format: 'pdf' | 'csv') =>
    api.get<{ download_url: string }>(`/billing/export?format=${format}`),

  // Billing History / Transaction History
  getHistory: (params?: import('@/types/billing-history').BillingHistoryParams) => {
    const search = new URLSearchParams()
    if (params?.start_date) search.set('start_date', params.start_date)
    if (params?.end_date) search.set('end_date', params.end_date)
    if (params?.types?.length) params.types.forEach((t) => search.append('types', t))
    if (params?.query) search.set('query', params.query)
    if (params?.page != null) search.set('page', String(params.page))
    if (params?.page_size != null) search.set('page_size', String(params.page_size))
    if (params?.sort_by) search.set('sort_by', params.sort_by)
    if (params?.sort_order) search.set('sort_order', params.sort_order)
    if (params?.currency) search.set('currency', params.currency)
    const qs = search.toString()
    return api.get<import('@/types/billing-history').BillingHistoryResponse>(
      `/billing/history${qs ? `?${qs}` : ''}`
    )
  },

  getHistoryItem: (itemId: string) =>
    api.get<import('@/types/billing-history').BillingHistoryItem>(
      `/billing/history/${itemId}`
    ),

  getSubscriptionTimeline: (subscriptionId: string) =>
    api.get<import('@/types/billing-history').SubscriptionTimelineResponse>(
      `/billing/subscription/${subscriptionId}/timeline`
    ),
}
