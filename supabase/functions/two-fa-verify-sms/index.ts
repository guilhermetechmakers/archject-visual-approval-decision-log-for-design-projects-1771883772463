/**
 * 2FA Verify SMS - Verify 6-digit OTP and enable 2FA
 * Body: { code: string }
 * On success: enables 2FA, generates recovery codes, logs audit
 * Requires: Authorization Bearer token
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from 'https://esm.sh/bcryptjs@2.4.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RECOVERY_CODE_COUNT = 10
const RECOVERY_CODE_LENGTH = 10
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 10

function generateRecoveryCodes(): string[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const codes: string[] = []
  const seen = new Set<string>()
  while (codes.length < RECOVERY_CODE_COUNT) {
    let code = ''
    for (let i = 0; i < RECOVERY_CODE_LENGTH; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    if (!seen.has(code)) {
      seen.add(code)
      codes.push(code)
    }
  }
  return codes
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
    const body = await req.json().catch(() => ({}))
    const code = typeof body?.code === 'string' ? body.code.replace(/\s/g, '') : ''

    if (!/^\d{6}$/.test(code)) {
      return new Response(JSON.stringify({ message: 'Enter a valid 6-digit code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

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

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? ''
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()

    const { count } = await supabaseAdmin
      .from('otp_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since)

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return new Response(JSON.stringify({ message: 'Too many attempts. Try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: config } = await supabaseAdmin
      .from('user_2fa_config')
      .select('totp_secret, phone_number, method')
      .eq('user_id', user.id)
      .maybeSingle()

    const storedOtp = config?.totp_secret
    if (!storedOtp || config?.method !== 'sms') {
      return new Response(JSON.stringify({ message: 'SMS enrollment not started. Request a code first.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const valid = storedOtp === code

    await supabaseAdmin.from('otp_attempts').insert({
      user_id: user.id,
      method: 'sms',
      ip_address: ip || null,
      success: valid,
    })

    if (!valid) {
      return new Response(JSON.stringify({ message: 'Invalid code. Please try again.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const recoveryCodes = generateRecoveryCodes()
    const codeHashes = await Promise.all(recoveryCodes.map((c) => bcrypt.hash(c, 10)))

    await supabaseAdmin.from('user_2fa_config').upsert(
      {
        user_id: user.id,
        is_enabled: true,
        method: 'sms',
        phone_number: config.phone_number,
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

    await supabaseAdmin.from('profiles').update({ two_fa_enabled: true, updated_at: new Date().toISOString() }).eq('id', user.id)

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: '2fa_enrolled_sms',
      details: { ip_address: ip || null, user_agent: req.headers.get('user-agent') || null },
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
    console.error('two-fa-verify-sms error:', err)
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
