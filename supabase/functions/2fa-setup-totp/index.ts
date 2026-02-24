/**
 * 2FA Setup TOTP - Generate secret and otpauth URL for authenticator enrollment
 * GET - Returns secret (base32) and otpauthUrl for QR code generation
 * Requires: Authorization: Bearer <access_token>
 * Uses OTPAuth (RFC 6238) for TOTP
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as OTPAuth from 'https://esm.sh/otpauth@9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 5

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
    if (authError || !user?.email) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: existing } = await supabaseAdmin
      .from('user_2fa_config')
      .select('is_enabled')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing?.is_enabled) {
      return new Response(
        JSON.stringify({ message: '2FA is already enabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
    const { count } = await supabaseAdmin
      .from('otp_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('method', 'totp_setup')
      .gte('created_at', since)

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ message: 'Too many setup attempts. Try again later.', cooldownSeconds: 3600 }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const secret = new OTPAuth.Secret({ size: 20 })
    const secretBase32 = secret.base32
    const issuer = 'Archject'
    const label = user.email

    const totp = new OTPAuth.TOTP({
      issuer,
      label,
      secret,
      digits: 6,
      period: 30,
    })
    const otpauthUrl = totp.toString()

    await supabaseAdmin.from('otp_attempts').insert({
      user_id: user.id,
      method: 'totp_setup',
      ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
      success: true,
    })

    return new Response(
      JSON.stringify({
        secret: secretBase32,
        otpauthUrl,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('2fa-setup-totp error:', err)
    return new Response(
      JSON.stringify({ message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
