/**
 * Billing - Create SetupIntent for adding payment method
 * POST /billing/setup-intent
 * Returns clientSecret for Stripe Elements to collect card and attach to customer.
 * Requires STRIPE_SECRET_KEY. Creates Stripe customer if needed.
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

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  if (!stripeKey) {
    return new Response(
      JSON.stringify({
        clientSecret: `seti_mock_${Date.now()}_secret_${crypto.randomUUID().replace(/-/g, '')}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })

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

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      metadata: { userId: user.id },
    })

    return new Response(
      JSON.stringify({ clientSecret: setupIntent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
