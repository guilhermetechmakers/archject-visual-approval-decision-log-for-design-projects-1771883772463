/**
 * Billing History API - Transactions, invoices, subscription timeline
 */

import { api } from '@/lib/api'
import type {
  BillingHistoryItem,
  BillingHistoryParams,
  BillingHistoryResponse,
  SubscriptionTimelineResponse,
  BillingSummary,
} from '@/types/billing-history'

function buildQueryString(params: BillingHistoryParams): string {
  const search = new URLSearchParams()
  if (params.start_date) search.set('start_date', params.start_date)
  if (params.end_date) search.set('end_date', params.end_date)
  if (params.types?.length) params.types.forEach((t) => search.append('types', t))
  if (params.query) search.set('query', params.query)
  if (params.page != null) search.set('page', String(params.page))
  if (params.page_size != null) search.set('page_size', String(params.page_size))
  if (params.sort_by) search.set('sort_by', params.sort_by)
  if (params.sort_order) search.set('sort_order', params.sort_order)
  if (params.currency) search.set('currency', params.currency)
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const billingHistoryApi = {
  getHistory: (params?: BillingHistoryParams) =>
    api.get<BillingHistoryResponse>(
      `/billing/history${buildQueryString(params ?? {})}`
    ),

  getHistoryItem: (itemId: string) =>
    api.get<BillingHistoryItem>(`/billing/history/${itemId}`),

  getInvoiceDownloadUrl: (invoiceId: string, format?: 'pdf' | 'csv' | 'json') => {
    const qs = format ? `?format=${format}` : ''
    return api.get<{ url: string; download_url?: string }>(
      `/billing/invoice/${invoiceId}/download${qs}`
    )
  },

  getSubscriptionTimeline: (subscriptionId: string) =>
    api.get<SubscriptionTimelineResponse>(
      `/billing/subscription/${subscriptionId}/timeline`
    ),

  getSubscription: (subscriptionId: string) =>
    api.get<{ id: string; plan_id: string; status: string }>(
      `/billing/subscription/${subscriptionId}`
    ),

  getSummary: (params?: { start_date?: string; end_date?: string }) => {
    const search = new URLSearchParams()
    if (params?.start_date) search.set('start_date', params.start_date)
    if (params?.end_date) search.set('end_date', params.end_date)
    const qs = search.toString()
    return api.get<BillingSummary>(`/billing/history/summary${qs ? `?${qs}` : ''}`)
  },
}
