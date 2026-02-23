/**
 * Mock billing data for when API is unavailable
 */

import type {
  BillingSubscription,
  BillingInvoice,
  Plan,
  BillingAddOn,
  ProrationEstimate,
} from '@/types/billing'
import type { InvoicesResponse } from '@/api/billing'

export const MOCK_PLANS: Plan[] = [
  {
    id: 'plan_starter',
    name: 'Starter',
    price: 29,
    currency: 'USD',
    interval: 'monthly',
    features: ['5 projects', '50 decisions/month', '10GB storage', 'Email support'],
    limits: { projects: 5, decisions_per_month: 50, storage: 10 },
    is_active: true,
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    price: 79,
    currency: 'USD',
    interval: 'monthly',
    features: ['20 projects', '200 decisions/month', '50GB storage', 'Priority support', 'PDF exports'],
    limits: { projects: 20, decisions_per_month: 200, storage: 50 },
    is_active: true,
  },
  {
    id: 'plan_team',
    name: 'Team',
    price: 199,
    currency: 'USD',
    interval: 'monthly',
    features: ['Unlimited projects', 'Unlimited decisions', '200GB storage', '10 seats', 'Enterprise integrations'],
    limits: { projects: -1, decisions_per_month: -1, storage: 200, seats: 10 },
    is_active: true,
  },
]

export const MOCK_SUBSCRIPTION: BillingSubscription = {
  subscription: {
    id: 'sub_123',
    user_id: 'user_1',
    plan_id: 'plan_starter',
    status: 'active',
    current_period_start: '2025-02-23',
    current_period_end: '2025-03-23',
    next_billing_date: '2025-03-23',
    quantity: 1,
    trial_period_end: null,
    prorated_amount: null,
  },
  plan: MOCK_PLANS[0],
  usage: {
    projects: { used: 3, limit: 5 },
    decisions: { used: 28, limit: 50 },
    storage: { used: 2.4, limit: 10 },
    seats: { used: 1, limit: 1 },
  },
  payment_method: {
    id: 'pm_1',
    user_id: 'user_1',
    stripe_payment_method_id: 'pm_xxx',
    brand: 'Visa',
    last4: '4242',
    exp_month: 12,
    exp_year: 2026,
    is_default: true,
  },
  renewal_status: 'renewing',
}

export const MOCK_INVOICES: BillingInvoice[] = [
  {
    id: 'inv_1',
    subscription_id: 'sub_123',
    invoice_number: 'INV-2025-0023',
    invoice_date: '2025-02-23',
    amount_due: 29,
    currency: 'USD',
    status: 'paid',
    pdf_url: '/invoices/inv_1.pdf',
    pdf_generated_at: '2025-02-23T10:00:00Z',
  },
  {
    id: 'inv_2',
    subscription_id: 'sub_123',
    invoice_number: 'INV-2025-0015',
    invoice_date: '2025-01-23',
    amount_due: 29,
    currency: 'USD',
    status: 'paid',
    pdf_url: '/invoices/inv_2.pdf',
    pdf_generated_at: '2025-01-23T10:00:00Z',
  },
  {
    id: 'inv_3',
    subscription_id: 'sub_123',
    invoice_number: 'INV-2024-0098',
    invoice_date: '2024-12-23',
    amount_due: 29,
    currency: 'USD',
    status: 'paid',
    pdf_url: '/invoices/inv_3.pdf',
    pdf_generated_at: '2024-12-23T10:00:00Z',
  },
]

export const MOCK_ADDONS: BillingAddOn[] = [
  {
    id: 'addon_pdf',
    name: 'PDF Exports',
    description: 'Export decisions and approval logs as branded PDF documents.',
    price: 9,
    currency: 'USD',
    interval: 'monthly',
    features: ['Unlimited PDF exports', 'Custom branding', 'Batch export'],
  },
  {
    id: 'addon_enterprise',
    name: 'Enterprise Integrations',
    description: 'Connect with Autodesk Forge, BIM 360, and other enterprise tools.',
    price: 49,
    currency: 'USD',
    interval: 'monthly',
    features: ['Autodesk Forge', 'BIM 360', 'API access', 'Webhooks'],
  },
  {
    id: 'addon_support',
    name: 'Priority Support',
    description: 'Get faster response times and dedicated support.',
    price: 19,
    currency: 'USD',
    interval: 'monthly',
    features: ['4-hour response SLA', 'Dedicated support channel', 'Phone support'],
  },
]

export const MOCK_PRORATION: ProrationEstimate = {
  prorated_amount: 35.48,
  credit_amount: 0,
  new_period_start: '2025-02-23',
  new_period_end: '2025-03-23',
  estimated_bill: 35.48,
}

export function getMockInvoicesResponse(params?: {
  page?: number
  limit?: number
  status?: string
}): InvoicesResponse {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 10
  let filtered = [...MOCK_INVOICES]
  if (params?.status) {
    filtered = filtered.filter((i) => i.status === params.status)
  }
  const start = (page - 1) * limit
  const invoices = filtered.slice(start, start + limit)
  return {
    invoices,
    total: filtered.length,
    page,
    limit,
  }
}
