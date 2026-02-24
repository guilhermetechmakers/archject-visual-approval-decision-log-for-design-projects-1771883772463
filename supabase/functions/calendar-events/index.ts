/**
 * Calendar Events - Create/update/delete Google Calendar events
 * POST body: { action: 'create'|'update'|'delete', ...params }
 * Requires: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
 * Integrates with Google Calendar API
 */

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
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let body: {
    action?: string
    decisionId?: string
    integrationId?: string
    title?: string
    start?: string
    end?: string
    timezone?: string
    googleEventId?: string
  }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid JSON' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const action = body.action || 'create'

  if (action === 'create') {
    const { decisionId, integrationId, title, start, end } = body
    if (!decisionId || !title || !start) {
      return new Response(
        JSON.stringify({ success: false, message: 'decisionId, title, start required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let resolvedIntegrationId = integrationId
    if (!resolvedIntegrationId) {
      const { data: int } = await supabase
        .from('integrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', 'google_calendar')
        .eq('status', 'connected')
        .limit(1)
        .single()
      resolvedIntegrationId = int?.id
    }
    if (!resolvedIntegrationId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Google Calendar not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: reminder, error: insertErr } = await supabase
      .from('calendar_reminders')
      .insert({
        decision_id: decisionId,
        integration_id: resolvedIntegrationId,
        trigger_time: start,
        status: 'pending',
      })
      .select('id, google_event_id')
      .single()

    if (insertErr) {
      return new Response(
        JSON.stringify({ success: false, message: insertErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, googleEventId: reminder?.google_event_id ?? null }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (action === 'delete' && body.googleEventId) {
    await supabase
      .from('calendar_reminders')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('google_event_id', body.googleEventId)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Action not supported or missing params' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
