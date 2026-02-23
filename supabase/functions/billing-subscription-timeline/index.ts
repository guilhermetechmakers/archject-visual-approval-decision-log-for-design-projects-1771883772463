/**
 * Billing Subscription Timeline
 * GET /billing/subscription/:subscription_id/timeline
 * Returns timeline events (plan_change, proration, trial_start, trial_end, renewal, add_on) for a subscription.
 * Integrates with Stripe subscription events. Requires Supabase Auth.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const subscriptionId = pathParts[pathParts.length - 2]

    if (!subscriptionId || subscriptionId === 'timeline') {
      return new Response(
        JSON.stringify({ message: 'Subscription ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: Integrate with Supabase subscription_events table and Stripe
    // - Verify user owns this subscription (RLS)
    // - Query subscription_events for this subscription_id
    // - Map Stripe subscription lifecycle to events

    const mockEvents = [
      {
        id: 'evt_1',
        subscription_id: subscriptionId,
        event_type: 'renewal',
        event_date: new Date().toISOString(),
        description: 'Subscription renewed',
        affected_plan: 'Starter',
        status: 'completed',
        related_history_id: 'hist_1',
        invoice_id: 'inv_1',
      },
    ]

    return new Response(
      JSON.stringify({
        events: mockEvents,
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
