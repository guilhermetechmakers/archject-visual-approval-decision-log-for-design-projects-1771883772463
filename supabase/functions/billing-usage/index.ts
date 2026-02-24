/**
 * Billing - Usage (Metered Billing)
 * POST /api/billing/usage
 * Records usage for metered billing. Sends usage records to Stripe.
 * Body: { subscription_item_id, quantity, timestamp?, action? }
 * Requires STRIPE_SECRET_KEY. Uses Supabase Auth JWT.
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
    const { subscription_item_id, quantity, timestamp, action } = body

    if (!subscription_item_id || quantity == null) {
      return new Response(
        JSON.stringify({ message: 'subscription_item_id and quantity required' }),
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
    await stripe.subscriptionItems.createUsageRecord(
      String(subscription_item_id),
      {
        quantity: Math.max(0, parseInt(String(quantity), 10)),
        timestamp: timestamp ? Math.floor(new Date(timestamp).getTime() / 1000) : undefined,
        action: action ?? 'increment',
      }
    )

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
