/**
 * Billing / Subscription types for Archject
 */

export interface PlanLimits {
  usage?: number
  seats?: number
  storage?: number
  projects?: number
  decisions?: number
  decisions_per_month?: number
}

export interface Plan {
  id: string
  name: string
  price: number
  currency?: string
  interval: 'monthly' | 'yearly'
  features: string[]
  limits: PlanLimits
  is_active: boolean
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_start: string
  current_period_end: string
  next_billing_date: string
  quantity: number
  trial_period_end?: string | null
  prorated_amount?: number | null
}

export interface UsageMeters {
  projects?: { used: number; limit: number }
  decisions?: { used: number; limit: number }
  storage?: { used: number; limit: number }
  seats?: { used: number; limit: number }
}

export interface BillingSubscription {
  subscription: Subscription
  plan: Plan
  usage?: UsageMeters
  payment_method?: BillingPaymentMethod | null
  renewal_status?: 'renewing' | 'canceling' | 'past_due'
}

export interface BillingInvoice {
  id: string
  subscription_id: string
  invoice_number?: string
  invoice_date: string
  amount_due: number
  currency: string
  status: 'paid' | 'due' | 'overdue' | 'pending' | 'failed'
  pdf_url?: string | null
  pdf_generated_at?: string | null
}

export interface BillingPaymentMethod {
  id: string
  user_id: string
  stripe_payment_method_id?: string
  brand: string
  last4: string
  exp_month: number
  exp_year: number
  is_default: boolean
}

export interface BillingAddOn {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval?: 'one_time' | 'monthly' | 'yearly'
  features: string[]
}

export interface ProrationEstimate {
  prorated_amount: number
  credit_amount?: number
  new_period_start: string
  new_period_end: string
  estimated_bill: number
}

export interface PlanChangeRequest {
  plan_id: string
  interval?: 'monthly' | 'yearly'
}

export interface PlanChangeResponse {
  proration: ProrationEstimate
  success: boolean
}
