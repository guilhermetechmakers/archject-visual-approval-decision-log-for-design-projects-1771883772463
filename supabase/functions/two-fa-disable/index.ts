/**
 * 2FA Disable - Disable 2FA for the user
 * Requires: Authorization Bearer token
 * Optional body: { password?: string } for re-auth (future enhancement)
 * Logs audit event
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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(JSON.stringify({ message: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.getUser(token)
    if (getUserError || !user?.id) {
      return new Response(JSON.stringify({ message: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: config } = await supabaseAdmin
      .from('user_2fa_config')
      .select('is_enabled')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!config?.is_enabled) {
      return new Response(JSON.stringify({ message: '2FA is not enabled' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabaseAdmin
      .from('user_2fa_config')
      .update({
        is_enabled: false,
        totp_secret: null,
        phone_number: null,
        phone_verified_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    await supabaseAdmin.from('recovery_codes').delete().eq('user_id', user.id)

    await supabaseAdmin.from('profiles').update({ two_fa_enabled: false, updated_at: new Date().toISOString() }).eq('id', user.id)

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: '2fa_disabled',
      details: { ip_address: ip, user_agent: req.headers.get('user-agent') || null },
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Two-factor authentication disabled',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('two-fa-disable error:', err)
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
