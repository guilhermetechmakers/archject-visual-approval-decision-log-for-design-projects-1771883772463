/**
 * 2FA Verify SMS - Verify 6-digit OTP and complete SMS enrollment
 * POST body: { code: string }
 * Requires: Authorization: Bearer <access_token>
 * On success: enables 2FA, generates recovery codes, logs audit event
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateRecoveryCodes(count: number): string[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const codes: string[] = []
  const crypto = globalThis.crypto
  for (let i = 0; i < count; i++) {
    let code = ''
    for (let j = 0; j < 8; j++) {
      code += chars[crypto.getRandomValues(new Uint8Array(1))[0] % chars.length]
    }
    codes.push(code)
  }
  return codes
}

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

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
    const body = await req.json() as { code?: string }
    const code = typeof body?.code === 'string' ? body.code.replace(/\s/g, '') : ''

    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ message: 'Please enter a valid 6-digit code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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

    const inputHash = await hashCode(code + user.id + 'sms_pending')

    const { data: pending, error: pendingError } = await supabaseAdmin
      .from('sms_otp_pending')
      .select('otp_hash, expires_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (pendingError || !pending) {
      return new Response(
        JSON.stringify({ message: 'No verification in progress. Please request a new code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new Date(pending.expires_at) < new Date()) {
      await supabaseAdmin.from('sms_otp_pending').delete().eq('user_id', user.id)
      return new Response(
        JSON.stringify({ message: 'Verification code expired. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (pending.otp_hash !== inputHash) {
      await supabaseAdmin.from('otp_attempts').insert({
        user_id: user.id,
        method: 'sms_verify',
        ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
        success: false,
      })
      return new Response(
        JSON.stringify({ message: 'Invalid code. Please try again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabaseAdmin.from('sms_otp_pending').delete().eq('user_id', user.id)

    const recoveryCodes = generateRecoveryCodes(10)
    const codeHashes = await Promise.all(recoveryCodes.map((c) => hashCode(c)))

    await supabaseAdmin.from('user_2fa_config').upsert(
      {
        user_id: user.id,
        is_enabled: true,
        method: 'sms',
        totp_secret: null,
        phone_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    for (const hash of codeHashes) {
      await supabaseAdmin.from('recovery_codes').insert({
        user_id: user.id,
        code_hash: hash,
      })
    }

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: '2fa_enrolled',
      target_id: user.id,
      details: { method: 'sms', ip_address: ip, user_agent: userAgent },
    })

    await supabaseAdmin.from('otp_attempts').insert({
      user_id: user.id,
      method: 'sms_verify',
      ip_address: ip,
      success: true,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Two-factor authentication enabled',
        recoveryCodes,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('2fa-verify-sms error:', err)
    return new Response(
      JSON.stringify({ message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
