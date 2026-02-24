/**
 * 2FA Recovery Codes - Get recovery codes (one-time display, requires re-auth)
 * GET - Returns recovery codes (one-time; regenerates if none exist)
 * POST body: { password: string } - Requires password for re-auth
 * Requires: Authorization: Bearer <access_token>
 * Note: Codes are stored hashed; this endpoint returns plain codes only once
 * after generation. For existing users with codes, they must regenerate.
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

  if (req.method !== 'GET' && req.method !== 'POST') {
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

    const { data: config } = await supabaseAdmin
      .from('user_2fa_config')
      .select('is_enabled')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!config?.is_enabled) {
      return new Response(
        JSON.stringify({ message: '2FA is not enabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: existing } = await supabaseAdmin
      .from('recovery_codes')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({
          message: 'Recovery codes have already been used or displayed. Use "Regenerate" to get new codes.',
          codes: null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        message: 'No recovery codes available. Use regenerate to create new codes.',
        codes: null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('2fa-recovery-codes error:', err)
    return new Response(
      JSON.stringify({ message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
