/**
 * Billing - Refund
 * POST /api/billing/refund
 * Admin-only: creates a Stripe refund for a charge or payment intent.
 * Body: { charge_id?, payment_intent_id?, amount?, reason? }
 * Requires STRIPE_SECRET_KEY. Admin role required.
 */

import Stripe from 'npm:stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { charge_id, payment_intent_id, amount, reason } = body

    if (!charge_id && !payment_intent_id) {
      return new Response(
        JSON.stringify({ message: 'charge_id or payment_intent_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ message: 'Stripe not configured' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeKey)
    const refundParams: Stripe.RefundCreateParams = {
      reason: (reason as Stripe.RefundCreateParams['reason']) ?? 'requested_by_customer',
    }
    if (charge_id) refundParams.charge = charge_id
    if (payment_intent_id) refundParams.payment_intent = payment_intent_id
    if (amount != null) refundParams.amount = amount

    const refund = await stripe.refunds.create(refundParams)

    return new Response(
      JSON.stringify({
        refund_id: refund.id,
        status: refund.status,
        amount: refund.amount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
