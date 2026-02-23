/**
 * Billing History React Query hooks with API + mock fallback
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { billingHistoryApi } from '@/api/billing-history'
import type { BillingHistoryParams } from '@/types/billing-history'
import {
  getMockHistoryResponse,
  getMockSubscriptionTimelineResponse,
  MOCK_HISTORY_SUMMARY,
} from '@/lib/billing-history-mock'

const BILLING_HISTORY_KEYS = ['billing-history'] as const

async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export function useBillingHistory(params?: BillingHistoryParams) {
  return useQuery({
    queryKey: [...BILLING_HISTORY_KEYS, 'history', params],
    queryFn: () =>
      withFallback(
        () => billingHistoryApi.getHistory(params),
        getMockHistoryResponse(params)
      ),
  })
}

export function useBillingHistoryItem(itemId: string | null) {
  return useQuery({
    queryKey: [...BILLING_HISTORY_KEYS, 'item', itemId],
    queryFn: () => billingHistoryApi.getHistoryItem(itemId!),
    enabled: !!itemId,
  })
}

export function useSubscriptionTimeline(subscriptionId: string | null) {
  return useQuery({
    queryKey: [...BILLING_HISTORY_KEYS, 'timeline', subscriptionId],
    queryFn: () =>
      withFallback(
        () => billingHistoryApi.getSubscriptionTimeline(subscriptionId!),
        subscriptionId ? getMockSubscriptionTimelineResponse(subscriptionId) : { events: [] }
      ),
    enabled: !!subscriptionId,
  })
}

export function useBillingSummary(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: [...BILLING_HISTORY_KEYS, 'summary', params],
    queryFn: () =>
      withFallback(() => billingHistoryApi.getSummary(params), MOCK_HISTORY_SUMMARY),
  })
}

export function useBillingHistoryQueryClient() {
  return useQueryClient()
}
