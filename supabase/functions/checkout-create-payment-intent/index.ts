/**
 * Checkout - Create Payment Intent
 * POST /checkout/create-payment-intent
 * Integrates with Stripe API. Requires STRIPE_SECRET_KEY in Supabase secrets.
 * Body: { planId?, addonIds?, seats?, billingAddress?, couponCode?, interval? }
 * Returns: { clientSecret, paymentIntentId, amount, currency, taxAmount?, prorations?, discount? }
 */

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(
      JSON.stringify({ message: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(
      JSON.stringify({ message: 'Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    const { planId, addonIds, seats = 1, couponCode } = body

    // Calculate amount from plans/addons (from DB or mock)
    let amountCents = 3500
    const currency = 'usd'

    if (planId) {
      const { data: plan } = await supabase
        .from('billing_plans')
        .select('price, interval')
        .eq('id', planId)
        .single()
      if (plan) amountCents = (plan.price as number) * (seats ?? 1)
    }

    const addonIdsArr = Array.isArray(addonIds) ? addonIds : []
    if (addonIdsArr.length) {
      const { data: addons } = await supabase
        .from('billing_addons')
        .select('price')
        .in('id', addonIdsArr)
      addons?.forEach((a) => { amountCents += (a.price as number) ?? 0 })
    }

    // Apply coupon (mock: WELCOME10, SAVE20)
    let discountAmount = 0
    if (couponCode) {
      const code = String(couponCode).toUpperCase()
      if (code === 'WELCOME10') discountAmount = Math.round(amountCents * 0.1)
      if (code === 'SAVE20') discountAmount = 2000
      amountCents = Math.max(0, amountCents - discountAmount)
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })

      // Get or create Stripe customer
      const { data: customer } = await supabase
        .from('billing_customers')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()

      let stripeCustomerId = customer?.stripe_customer_id as string | undefined

      if (!stripeCustomerId) {
        const supabaseUser = await supabase.auth.admin.getUserById(user.id)
        const email = supabaseUser?.data?.user?.email ?? user.email
        const stripeCustomer = await stripe.customers.create({
          email: email ?? undefined,
          metadata: { userId: user.id },
        })
        stripeCustomerId = stripeCustomer.id
        await supabase.from('billing_customers').upsert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency,
        customer: stripeCustomerId,
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: user.id,
          planId: planId ?? '',
          addonIds: addonIdsArr.join(','),
        },
      })

      const taxAmount = Math.round(amountCents * 0.08)
      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: amountCents,
          currency,
          taxAmount,
          prorations: [],
          discount:
            discountAmount > 0 && couponCode
              ? { amount: discountAmount, code: couponCode }
              : undefined,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mock when Stripe not configured
    const mockSecret = `pi_mock_${Date.now()}_secret_${crypto.randomUUID().replace(/-/g, '')}`
    return new Response(
      JSON.stringify({
        clientSecret: mockSecret,
        paymentIntentId: `pi_mock_${Date.now()}`,
        amount: amountCents,
        currency,
        taxAmount: Math.round(amountCents * 0.08),
        prorations: [],
        discount:
          discountAmount > 0 && couponCode
            ? { amount: discountAmount, code: couponCode }
            : undefined,
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
