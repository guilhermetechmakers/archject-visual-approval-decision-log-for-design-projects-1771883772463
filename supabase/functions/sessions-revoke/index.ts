/**
 * Sessions Revoke - Supabase Edge Function
 * Revokes user sessions (single or all except current).
 * Integrates with user_sessions table and token_audit.
 *
 * POST body: { sessionId?: string, revokeAllExceptCurrent?: boolean }
 * Requires: Authorization: Bearer <access_token>
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

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : null
    const revokeAllExceptCurrent = Boolean(body?.revokeAllExceptCurrent)
    const currentSessionId = typeof body?.currentSessionId === 'string' ? body.currentSessionId.trim() : null

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null

    if (sessionId) {
      const { data: session, error: fetchError } = await supabase
        .from('user_sessions')
        .select('id, user_id')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !session) {
        return new Response(
          JSON.stringify({ message: 'Session not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ is_revoked: true, last_used_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('sessions-revoke update error:', updateError)
        return new Response(
          JSON.stringify({ message: 'Failed to revoke session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await supabase.from('token_audit').insert({
        user_id: user.id,
        action: 'session_revoke',
        target_session_id: sessionId,
        actor_type: 'user',
        actor_id: user.id,
        ip_address: ip,
        details: { session_id: sessionId },
      })

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (revokeAllExceptCurrent) {
      let query = supabase
        .from('user_sessions')
        .update({ is_revoked: true })
        .eq('user_id', user.id)
        .eq('is_revoked', false)
      if (currentSessionId) {
        query = query.neq('id', currentSessionId)
      }
      const { data: revoked, error: updateError } = await query.select('id')

      if (updateError) {
        console.error('sessions-revoke-all update error:', updateError)
        return new Response(
          JSON.stringify({ message: 'Failed to revoke sessions' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      await supabase.from('token_audit').insert({
        user_id: user.id,
        action: 'session_revoke_all',
        actor_type: 'user',
        actor_id: user.id,
        ip_address: ip,
        details: { count: revoked?.length ?? 0 },
      })

      return new Response(
        JSON.stringify({ success: true, revoked: revoked?.length ?? 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ message: 'Provide sessionId or revokeAllExceptCurrent' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('sessions-revoke error:', err)
    return new Response(
      JSON.stringify({ message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
