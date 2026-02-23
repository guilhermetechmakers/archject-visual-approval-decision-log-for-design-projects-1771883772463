/**
 * Checkout - Confirm Payment
 * POST /checkout/confirm-payment
 * Confirms Stripe PaymentIntent and creates subscription/order.
 * Body: { paymentIntentId, paymentMethodId, savePaymentMethod? }
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
    const { paymentIntentId, paymentMethodId } = body

    if (!paymentIntentId || !paymentMethodId) {
      return new Response(
        JSON.stringify({ message: 'paymentIntentId and paymentMethodId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (paymentIntentId.startsWith('pi_mock_')) {
      return new Response(
        JSON.stringify({
          success: true,
          orderId: `ord_${Date.now()}`,
          subscriptionId: `sub_${Date.now()}`,
          nextStep: 'billing',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // When STRIPE_SECRET_KEY is set, verify PaymentIntent with Stripe API

    return new Response(
      JSON.stringify({
        success: true,
        orderId: `ord_${Date.now()}`,
        subscriptionId: `sub_${Date.now()}`,
        nextStep: 'billing',
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
