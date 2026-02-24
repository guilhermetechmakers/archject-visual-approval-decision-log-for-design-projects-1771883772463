/**
 * 2FA Audit - Get 2FA-related audit log entries
 * GET ?limit=20&offset=0
 * Requires: Authorization: Bearer <access_token>
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TWO_FA_ACTIONS = ['2fa_enrolled', '2fa_disabled', '2fa_recovery_codes_regenerated']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(
      JSON.stringify({ message: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    let limit = 20
    let offset = 0
    try {
      const body = await req.json() as { limit?: number; offset?: number }
      if (typeof body?.limit === 'number') limit = Math.min(body.limit, 50)
      if (typeof body?.offset === 'number') offset = Math.max(body.offset, 0)
    } catch {
      // Use defaults
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: rows, error } = await supabaseAdmin
      .from('audit_logs')
      .select('id, action, details, timestamp')
      .eq('user_id', user.id)
      .in('action', TWO_FA_ACTIONS)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('2fa-audit select error:', error)
      return new Response(
        JSON.stringify({ message: 'Failed to fetch audit logs' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const logs = (rows ?? []).map((r: { id: string; action: string; details: unknown; timestamp: string }) => ({
      id: r.id,
      action: r.action,
      details: r.details,
      created_at: r.timestamp,
    }))

    return new Response(
      JSON.stringify({ logs }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('2fa-audit error:', err)
    return new Response(
      JSON.stringify({ message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
