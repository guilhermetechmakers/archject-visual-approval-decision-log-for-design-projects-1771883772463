/**
 * Billing History / Transaction types for Archject
 */

export type TransactionType =
  | 'invoice'
  | 'payment'
  | 'refund'
  | 'charge'
  | 'proration'
  | 'trial'
  | 'renewal'
  | 'suspension'
  | 'cancellation'

export type TransactionStatus =
  | 'paid'
  | 'pending'
  | 'due'
  | 'overdue'
  | 'failed'
  | 'refunded'

export interface BillingHistoryItem {
  id: string
  type: TransactionType
  date: string
  amount: number
  currency: string
  status: TransactionStatus
  invoice_id?: string | null
  receipt_id?: string | null
  subscription_id?: string | null
  description: string
  downloadable_receipt_url?: string | null
  payment_method?: 'card' | 'ach' | 'stripe' | null
  last4?: string | null
  account_balance?: number | null
}

export interface BillingHistoryParams {
  start_date?: string
  end_date?: string
  types?: TransactionType[]
  query?: string
  page?: number
  page_size?: number
  sort_by?: 'date' | 'type' | 'amount'
  sort_order?: 'asc' | 'desc'
  currency?: string
}

export interface BillingHistoryResponse {
  items: BillingHistoryItem[]
  total: number
  page: number
  page_size: number
}

export interface BillingHistorySummary {
  total_paid: number
  total_outstanding: number
  total_refunds: number
  currency: string
}

export type SubscriptionEventType =
  | 'plan_change'
  | 'proration'
  | 'trial_start'
  | 'trial_end'
  | 'renewal'
  | 'add_on'
  | 'suspension'
  | 'cancellation'

export interface SubscriptionTimelineEvent {
  id: string
  subscription_id: string
  event_type: SubscriptionEventType
  event_date: string
  description: string
  affected_plan?: string | null
  affected_addon?: string | null
  status: string
  related_history_id?: string | null
  invoice_id?: string | null
}

export interface SubscriptionTimelineResponse {
  events: SubscriptionTimelineEvent[]
}

export interface ReceiptDownloadOptions {
  pdf_url?: string | null
  invoice_id: string
  date: string
  amount: number
  currency: string
  customer_id?: string | null
  subscription_id?: string | null
  line_items_summary?: Array<{ description: string; amount: number }>
}
