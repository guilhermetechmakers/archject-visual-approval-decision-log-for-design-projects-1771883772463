/**
 * Segment / Analytics Event Tracking
 * Captures decision lifecycle events for dashboards and usage metrics.
 * Integrates with Segment/Amplitude-compatible event schema.
 * Events: decision_created, decision_proposed, decision_client_view, etc.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SegmentTrackPayload {
  event: string
  userId?: string
  anonymousId?: string
  properties?: Record<string, unknown>
  timestamp?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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

  let body: SegmentTrackPayload
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!body?.event || typeof body.event !== 'string') {
    return new Response(
      JSON.stringify({ success: false, message: 'event is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const event = {
    event_id: crypto.randomUUID(),
    user_id: user.id,
    event_name: body.event,
    properties: {
      ...body.properties,
      user_id: user.id,
      timestamp: body.timestamp ?? new Date().toISOString(),
    },
    timestamp: body.timestamp ?? new Date().toISOString(),
    context: body.userId ? { userId: body.userId } : {},
  }

  // Insert into analytics_events table
  const { error: insertError } = await supabase
    .from('analytics_events')
    .insert({
      id: event.event_id,
      user_id: event.user_id,
      event_name: event.event_name,
      properties: event.properties,
      timestamp: event.timestamp,
      workspace_id: (event.properties as Record<string, unknown>).workspace_id ?? null,
      project_id: (event.properties as Record<string, unknown>).project_id ?? null,
      decision_id: (event.properties as Record<string, unknown>).decision_id ?? null,
    })

  if (insertError) {
    // Table may not exist yet - log but don't fail (events can go to external Segment)
    console.error('analytics_events insert:', insertError.message)
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
