/**
 * Email Verification - Validate Token
 * Validates one-time verification token, marks user as verified.
 * Invoke as auth-verify-email function.
 * Body: { token: string } or GET ?token=xxx
 * Requires: JWT_SECRET (or VERIFICATION_SECRET) in Supabase secrets.
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

  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let token: string | null = null
  if (req.method === 'GET') {
    const url = new URL(req.url)
    token = url.searchParams.get('token')?.trim() ?? null
  } else {
    try {
      const body = await req.json()
      token = typeof body?.token === 'string' ? body.token.trim() : null
    } catch {
      token = null
    }
  }

  if (!token || token.length < 10) {
    return new Response(
      JSON.stringify({
        success: false,
        verified: false,
        message: 'Verification link is invalid or expired.',
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const tokenHash = await sha256(token)

    const { data: tokenRow, error: tokenError } = await supabaseAdmin
      .from('verification_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .maybeSingle()

    if (tokenError || !tokenRow) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Verification link is invalid or expired.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (tokenRow.used_at) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'This verification link has already been used.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const expiresAt = new Date(tokenRow.expires_at)
    if (expiresAt.getTime() < Date.now()) {
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Verification link has expired. Please request a new one.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = tokenRow.user_id

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_email_confirmed')
      .eq('id', userId)
      .maybeSingle()

    if (profile?.is_email_confirmed) {
      await supabaseAdmin
        .from('verification_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenRow.id)

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          message: 'Your email is already verified. You can sign in and access all features.',
          userId,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: updateTokenError } = await supabaseAdmin
      .from('verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenRow.id)

    if (updateTokenError) {
      console.error('verification_tokens update error:', updateTokenError)
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Verification failed. Please try again.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_email_confirmed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (profileError) {
      console.error('profiles update error:', profileError)
      return new Response(
        JSON.stringify({
          success: false,
          verified: false,
          message: 'Verification failed. Please try again.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true,
      })
    } catch {
      // Non-fatal: profiles.is_email_confirmed is source of truth
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action: 'email_verification_completed',
      details: {},
    })

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        message: 'Your email has been verified.',
        userId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('auth-verify-email error:', err)
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
