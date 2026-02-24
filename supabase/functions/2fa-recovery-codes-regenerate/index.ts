/**
 * 2FA Recovery Codes Regenerate - Generate new recovery codes (requires password)
 * POST body: { password: string }
 * Requires: Authorization: Bearer <access_token>
 * On success: invalidates old codes, generates new ones, returns plain codes (one-time)
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
    const body = await req.json() as { password?: string }
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!password) {
      return new Response(
        JSON.stringify({ message: 'Password is required to regenerate recovery codes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { user: tokenUser }, error: getUserError } = await supabaseAdmin.auth.getUser(token)
    if (getUserError || !tokenUser?.email) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user: verifyUser }, error: verifyError } = await createClient(supabaseUrl, supabaseAnonKey)
      .auth.signInWithPassword({
        email: tokenUser.email,
        password,
      })

    if (verifyError || !verifyUser || verifyUser.user.id !== tokenUser.id) {
      return new Response(
        JSON.stringify({ message: 'Incorrect password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: config } = await supabaseAdmin
      .from('user_2fa_config')
      .select('is_enabled')
      .eq('user_id', tokenUser.id)
      .maybeSingle()

    if (!config?.is_enabled) {
      return new Response(
        JSON.stringify({ message: '2FA is not enabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabaseAdmin.from('recovery_codes').delete().eq('user_id', tokenUser.id)

    const recoveryCodes = generateRecoveryCodes(10)
    const codeHashes = await Promise.all(recoveryCodes.map((c) => hashCode(c)))

    for (const hash of codeHashes) {
      await supabaseAdmin.from('recovery_codes').insert({
        user_id: tokenUser.id,
        code_hash: hash,
      })
    }

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    await supabaseAdmin.from('audit_logs').insert({
      user_id: tokenUser.id,
      action: '2fa_recovery_codes_regenerated',
      target_id: tokenUser.id,
      details: { ip_address: ip, user_agent: userAgent },
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'New recovery codes generated. Save them securely.',
        codes: recoveryCodes,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('2fa-recovery-codes-regenerate error:', err)
    return new Response(
      JSON.stringify({ message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
