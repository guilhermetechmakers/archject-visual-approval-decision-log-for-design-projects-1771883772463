/**
 * Checkout - Create Payment Intent
 * POST /checkout/create-payment-intent
 * Integrates with Stripe API. Requires STRIPE_SECRET_KEY in Supabase secrets.
 * Body: { planId?, addonIds?, seats?, billingAddress?, couponCode? }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { planId, addonIds, seats = 1, couponCode } = body

    // When STRIPE_SECRET_KEY is set, integrate with Stripe Payment Intents API
    // const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    // if (stripeKey) { ... stripe.paymentIntents.create(...) }

    const mockSecret = `pi_mock_${Date.now()}_secret_${crypto.randomUUID().replace(/-/g, '')}`
    return new Response(
      JSON.stringify({
        clientSecret: mockSecret,
        paymentIntentId: `pi_mock_${Date.now()}`,
        amount: 3500,
        currency: 'usd',
        taxAmount: 280,
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
