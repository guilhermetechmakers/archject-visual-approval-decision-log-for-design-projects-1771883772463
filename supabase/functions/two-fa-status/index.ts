/**
 * 2FA Status - GET current user 2FA configuration
 * Returns: is_enabled, method, phone (masked if SMS)
 * Requires: Authorization Bearer token
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

    const { data: config, error } = await supabaseAdmin
      .from('user_2fa_config')
      .select('is_enabled, method, phone_number')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('two-fa-status error:', error)
      return new Response(JSON.stringify({ message: 'Failed to fetch 2FA status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const phone = config?.phone_number
      ? config.phone_number.slice(-4).padStart(config.phone_number.length, '*')
      : null

    return new Response(
      JSON.stringify({
        success: true,
        isEnabled: config?.is_enabled ?? false,
        method: config?.method ?? null,
        phone: config?.method === 'sms' ? phone : null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('two-fa-status error:', err)
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
