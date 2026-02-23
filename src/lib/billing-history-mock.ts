/**
 * Mock billing history data for when API is unavailable
 */

import type {
  BillingHistoryItem,
  BillingHistoryResponse,
  BillingHistorySummary,
  BillingHistoryParams,
  SubscriptionTimelineEvent,
  SubscriptionTimelineResponse,
  TransactionType,
} from '@/types/billing-history'

export const MOCK_HISTORY_ITEMS: BillingHistoryItem[] = [
  {
    id: 'hist_1',
    type: 'payment',
    date: '2025-02-23T10:00:00Z',
    amount: 29,
    currency: 'USD',
    status: 'paid',
    invoice_id: 'inv_1',
    receipt_id: 'rcpt_1',
    subscription_id: 'sub_123',
    description: 'Starter plan - Monthly',
    downloadable_receipt_url: '/invoices/inv_1.pdf',
    payment_method: 'card',
    last4: '4242',
    account_balance: 0,
  },
  {
    id: 'hist_2',
    type: 'invoice',
    date: '2025-02-23T09:00:00Z',
    amount: 29,
    currency: 'USD',
    status: 'paid',
    invoice_id: 'inv_1',
    receipt_id: 'rcpt_1',
    subscription_id: 'sub_123',
    description: 'Invoice INV-2025-0023',
    downloadable_receipt_url: '/invoices/inv_1.pdf',
    payment_method: 'card',
    last4: '4242',
    account_balance: 0,
  },
  {
    id: 'hist_3',
    type: 'renewal',
    date: '2025-02-23T08:00:00Z',
    amount: 29,
    currency: 'USD',
    status: 'paid',
    subscription_id: 'sub_123',
    description: 'Subscription renewal - Starter',
    downloadable_receipt_url: '/invoices/inv_1.pdf',
    account_balance: 0,
  },
  {
    id: 'hist_4',
    type: 'payment',
    date: '2025-01-23T10:00:00Z',
    amount: 29,
    currency: 'USD',
    status: 'paid',
    invoice_id: 'inv_2',
    receipt_id: 'rcpt_2',
    subscription_id: 'sub_123',
    description: 'Starter plan - Monthly',
    downloadable_receipt_url: '/invoices/inv_2.pdf',
    payment_method: 'card',
    last4: '4242',
    account_balance: 0,
  },
  {
    id: 'hist_5',
    type: 'invoice',
    date: '2025-01-23T09:00:00Z',
    amount: 29,
    currency: 'USD',
    status: 'paid',
    invoice_id: 'inv_2',
    receipt_id: 'rcpt_2',
    subscription_id: 'sub_123',
    description: 'Invoice INV-2025-0015',
    downloadable_receipt_url: '/invoices/inv_2.pdf',
    account_balance: 0,
  },
  {
    id: 'hist_6',
    type: 'proration',
    date: '2024-12-28T14:00:00Z',
    amount: -12.5,
    currency: 'USD',
    status: 'paid',
    subscription_id: 'sub_123',
    description: 'Proration credit - Plan downgrade',
    account_balance: 0,
  },
  {
    id: 'hist_7',
    type: 'plan_change',
    date: '2024-12-28T14:00:00Z',
    amount: 0,
    currency: 'USD',
    status: 'paid',
    subscription_id: 'sub_123',
    description: 'Plan changed from Pro to Starter',
    account_balance: 0,
  },
  {
    id: 'hist_8',
    type: 'payment',
    date: '2024-12-23T10:00:00Z',
    amount: 79,
    currency: 'USD',
    status: 'paid',
    invoice_id: 'inv_pro_1',
    receipt_id: 'rcpt_pro_1',
    subscription_id: 'sub_123',
    description: 'Pro plan - Monthly',
    downloadable_receipt_url: '/invoices/inv_pro_1.pdf',
    payment_method: 'card',
    last4: '4242',
    account_balance: 0,
  },
  {
    id: 'hist_9',
    type: 'trial',
    date: '2024-11-23T10:00:00Z',
    amount: 0,
    currency: 'USD',
    status: 'paid',
    subscription_id: 'sub_123',
    description: 'Trial ended - Starter plan',
    account_balance: 0,
  },
  {
    id: 'hist_10',
    type: 'trial',
    date: '2024-10-23T10:00:00Z',
    amount: 0,
    currency: 'USD',
    status: 'paid',
    subscription_id: 'sub_123',
    description: 'Trial started - Starter plan',
    account_balance: 0,
  },
  {
    id: 'hist_11',
    type: 'refund',
    date: '2024-09-15T11:00:00Z',
    amount: -29,
    currency: 'USD',
    status: 'refunded',
    invoice_id: 'inv_ref_1',
    subscription_id: 'sub_123',
    description: 'Refund - Invoice INV-2024-0088',
    account_balance: 0,
  },
  {
    id: 'hist_12',
    type: 'invoice',
    date: '2025-03-23T00:00:00Z',
    amount: 29,
    currency: 'USD',
    status: 'pending',
    invoice_id: 'inv_upcoming',
    subscription_id: 'sub_123',
    description: 'Upcoming invoice - Starter plan',
    account_balance: 29,
  },
]

export const MOCK_SUBSCRIPTION_EVENTS: SubscriptionTimelineEvent[] = [
  {
    id: 'evt_1',
    subscription_id: 'sub_123',
    event_type: 'renewal',
    event_date: '2025-02-23T08:00:00Z',
    description: 'Subscription renewed',
    affected_plan: 'Starter',
    status: 'completed',
    related_history_id: 'hist_1',
    invoice_id: 'inv_1',
  },
  {
    id: 'evt_2',
    subscription_id: 'sub_123',
    event_type: 'proration',
    event_date: '2024-12-28T14:00:00Z',
    description: 'Proration credit applied',
    affected_plan: 'Starter',
    status: 'completed',
    related_history_id: 'hist_6',
    invoice_id: null,
  },
  {
    id: 'evt_3',
    subscription_id: 'sub_123',
    event_type: 'plan_change',
    event_date: '2024-12-28T14:00:00Z',
    description: 'Plan changed from Pro to Starter',
    affected_plan: 'Starter',
    status: 'completed',
    related_history_id: 'hist_7',
    invoice_id: null,
  },
  {
    id: 'evt_4',
    subscription_id: 'sub_123',
    event_type: 'trial_end',
    event_date: '2024-11-23T10:00:00Z',
    description: 'Trial period ended',
    affected_plan: 'Starter',
    status: 'completed',
    related_history_id: 'hist_9',
    invoice_id: null,
  },
  {
    id: 'evt_5',
    subscription_id: 'sub_123',
    event_type: 'trial_start',
    event_date: '2024-10-23T10:00:00Z',
    description: 'Trial period started',
    affected_plan: 'Starter',
    status: 'completed',
    related_history_id: 'hist_10',
    invoice_id: null,
  },
]

export const MOCK_HISTORY_SUMMARY: BillingHistorySummary = {
  total_paid: 195,
  total_outstanding: 29,
  total_refunds: 29,
  currency: 'USD',
}

function parseDateRange(params: BillingHistoryParams): { start: Date; end: Date } {
  const now = new Date()
  let start: Date
  let end = new Date(now)

  if (params.start_date && params.end_date) {
    start = new Date(params.start_date)
    end = new Date(params.end_date)
  } else if (params.start_date) {
    start = new Date(params.start_date)
  } else {
    // Default: last 90 days
    start = new Date(now)
    start.setDate(start.getDate() - 90)
  }

  return { start, end }
}

function filterByDateRange(
  items: BillingHistoryItem[],
  start: Date,
  end: Date
): BillingHistoryItem[] {
  return items.filter((item) => {
    const d = new Date(item.date)
    return d >= start && d <= end
  })
}

function filterByTypes(
  items: BillingHistoryItem[],
  types: TransactionType[] | undefined
): BillingHistoryItem[] {
  if (!types?.length) return items
  return items.filter((item) => types.includes(item.type))
}

function filterByQuery(items: BillingHistoryItem[], query: string | undefined): BillingHistoryItem[] {
  if (!query?.trim()) return items
  const q = query.toLowerCase()
  return items.filter(
    (item) =>
      item.invoice_id?.toLowerCase().includes(q) ||
      item.receipt_id?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
  )
}

function sortItems(
  items: BillingHistoryItem[],
  sortBy: 'date' | 'type' | 'amount' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): BillingHistoryItem[] {
  const sorted = [...items].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'date') {
      cmp = new Date(a.date).getTime() - new Date(b.date).getTime()
    } else if (sortBy === 'type') {
      cmp = a.type.localeCompare(b.type)
    } else if (sortBy === 'amount') {
      cmp = a.amount - b.amount
    }
    return sortOrder === 'asc' ? cmp : -cmp
  })
  return sorted
}

export function getMockHistoryResponse(
  params?: BillingHistoryParams
): BillingHistoryResponse {
  const page = params?.page ?? 1
  const pageSize = Math.min(100, Math.max(10, params?.page_size ?? 20))
  const sortBy = params?.sort_by ?? 'date'
  const sortOrder = params?.sort_order ?? 'desc'

  const { start, end } = parseDateRange(params ?? {})
  let filtered = filterByDateRange(MOCK_HISTORY_ITEMS, start, end)
  filtered = filterByTypes(filtered, params?.types)
  filtered = filterByQuery(filtered, params?.query)
  filtered = sortItems(filtered, sortBy, sortOrder)

  const total = filtered.length
  const startIdx = (page - 1) * pageSize
  const items = filtered.slice(startIdx, startIdx + pageSize)

  return {
    items,
    total,
    page,
    page_size: pageSize,
  }
}

export function getMockSubscriptionTimelineResponse(
  subscriptionId: string
): SubscriptionTimelineResponse {
  const events = MOCK_SUBSCRIPTION_EVENTS.filter(
    (e) => e.subscription_id === subscriptionId
  ).sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
  return { events }
}
