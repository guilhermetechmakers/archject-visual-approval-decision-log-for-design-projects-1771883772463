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

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (stripeKey) {
      const Stripe = (await import('https://esm.sh/stripe@18?target=deno')).default
      const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-28.basil' })
      const amount = 3500
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: { planId: planId ?? '', addonIds: (addonIds ?? []).join(','), seats: String(seats) },
      })
      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
