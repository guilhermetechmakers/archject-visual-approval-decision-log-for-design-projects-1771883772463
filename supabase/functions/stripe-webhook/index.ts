/**
 * Stripe Webhook Handler
 * POST /stripe-webhook
 * Validates Stripe webhook signature and processes events:
 *   invoice.paid, invoice.payment_failed, customer.subscription.updated,
 *   invoice.upcoming, invoice.finalized, charge.refunded, payment_intent.succeeded
 * Requires STRIPE_WEBHOOK_SECRET in Supabase secrets.
 */

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const payload = await req.text()
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')

  if (!webhookSecret || !signature) {
    return new Response(
      JSON.stringify({ message: 'Webhook secret or signature missing' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let event: Stripe.Event
  try {
    const stripe = new Stripe(stripeKey ?? '', { apiVersion: '2024-11-20.acacia' })
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err) {
    return new Response(
      JSON.stringify({ message: `Webhook signature verification failed: ${(err as Error).message}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    switch (event.type) {
      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const inv = event.data.object as Stripe.Invoice
        let userId = inv.metadata?.userId as string | undefined
        if (!userId && inv.customer) {
          const custId = typeof inv.customer === 'string' ? inv.customer : inv.customer
          const { data: cust } = await supabase
            .from('billing_customers')
            .select('user_id')
            .eq('stripe_customer_id', custId)
            .single()
          userId = cust?.user_id
        }
        if (userId) {
          await supabase.from('billing_invoices').upsert({
            stripe_invoice_id: inv.id,
            user_id: userId,
            amount_due: inv.amount_due,
            amount_paid: inv.amount_paid ?? inv.amount_due,
            currency: inv.currency ?? 'usd',
            status: 'paid',
            period_start: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
            period_end: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
            pdf_url: inv.invoice_pdf ?? null,
            hosted_invoice_url: inv.hosted_invoice_url ?? null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'stripe_invoice_id' })
        }
        break
      }
      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice
        let userId = inv.metadata?.userId as string | undefined
        if (!userId && inv.customer) {
          const custId = typeof inv.customer === 'string' ? inv.customer : inv.customer
          const { data: cust } = await supabase
            .from('billing_customers')
            .select('user_id')
            .eq('stripe_customer_id', custId)
            .single()
          userId = cust?.user_id
        }
        if (userId) {
          await supabase.from('billing_invoices').upsert({
            stripe_invoice_id: inv.id,
            user_id: userId,
            amount_due: inv.amount_due,
            amount_paid: 0,
            currency: inv.currency ?? 'usd',
            status: 'open',
            period_start: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
            period_end: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
            pdf_url: inv.invoice_pdf ?? null,
            hosted_invoice_url: inv.hosted_invoice_url ?? null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'stripe_invoice_id' })
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const { data: plan } = await supabase
          .from('billing_plans')
          .select('id')
          .eq('stripe_price_id', sub.items.data[0]?.price?.id)
          .single()
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id
        const { data: cust } = await supabase
          .from('billing_customers')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()
        if (cust && plan) {
          const statusMap: Record<string, string> = {
            active: 'active',
            trialing: 'trialing',
            past_due: 'past_due',
            canceled: 'canceled',
            incomplete: 'incomplete',
            incomplete_expired: 'incomplete_expired',
          }
          await supabase.from('billing_subscriptions').upsert({
            stripe_subscription_id: sub.id,
            user_id: cust.user_id,
            plan_id: plan.id,
            status: statusMap[sub.status] ?? 'incomplete',
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
            quantity: sub.items.data[0]?.quantity ?? 1,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'stripe_subscription_id' })
        }
        break
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await supabase.from('billing_audit_log').insert({
          action: 'refund',
          target_type: 'charge',
          target_id: charge.id,
          details: { amount: charge.amount_refunded, currency: charge.currency },
        })
        break
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        if (pi.metadata?.userId) {
          await supabase.from('billing_audit_log').insert({
            user_id: pi.metadata.userId,
            action: 'payment_succeeded',
            target_type: 'payment_intent',
            target_id: pi.id,
            details: { amount: pi.amount, currency: pi.currency },
          })
        }
        break
      }
      default:
        break
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
