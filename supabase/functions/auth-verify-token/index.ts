/**
 * Email Verification - Validate Token
 * Validates one-time verification token, marks user as verified.
 * Body: { token }
 * Response: { success, verified, message?, userId?, expiresAt? }
 * Requires: APP_URL in Supabase secrets for redirect URL.
 *
 * Integrates with: SendGrid (tokens sent via auth-send-verification)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
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

  try {
    const body = await req.json()
    const token = typeof body?.token === 'string' ? body.token.trim() : ''

    if (!token || token.length < 10) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Verification link is invalid or expired.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenHash = await sha256(token)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: rows, error: selectError } = await supabaseAdmin
      .from('email_verification_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .limit(1)

    if (selectError || !rows?.length) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Verification link is invalid or expired.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const row = rows[0]
    if (row.used_at) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'This verification link has already been used.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const expiresAt = new Date(row.expires_at)
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'This verification link has expired. Please request a new one.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark token as used
    await supabaseAdmin
      .from('email_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', row.id)

    // Update Supabase auth user - confirm email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(row.user_id, {
      email_confirm: true,
    })

    if (updateError) {
      console.error('auth.admin.updateUserById email_confirm error:', updateError)
    }

    // Update profiles.is_email_confirmed
    await supabaseAdmin
      .from('profiles')
      .update({ is_email_confirmed: true, updated_at: new Date().toISOString() })
      .eq('id', row.user_id)

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    await supabaseAdmin.from('audit_logs').insert({
      user_id: row.user_id,
      action: 'email_verification_completed',
      details: { ip_address: ip, user_agent: userAgent },
    })

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        userId: row.user_id,
        message: 'Your email has been verified.',
        expiresAt: row.expires_at,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('auth-verify-token error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        verified: false,
        message: 'Verification failed. Please try again later.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
