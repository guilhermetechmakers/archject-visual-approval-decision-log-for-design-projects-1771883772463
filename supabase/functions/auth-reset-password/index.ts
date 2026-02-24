/**
 * Password Reset - Reset Password with Token
 * POST /auth/reset-password (invoke as auth-reset-password function)
 * Validates token, updates password via Supabase Admin API, marks token used.
 * Body: { token, new_password, confirm_password }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PASSWORD_MIN_LENGTH = 12

function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  }
  if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter'
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter'
  if (!/\d/.test(password)) return 'Include at least one number'
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Include at least one special character'
  return null
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
    const newPassword = typeof body?.new_password === 'string' ? body.new_password : ''
    const confirmPassword = typeof body?.confirm_password === 'string' ? body.confirm_password : ''

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired reset link. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (newPassword !== confirmPassword) {
      return new Response(
        JSON.stringify({ message: 'Passwords do not match' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const pwdError = validatePassword(newPassword)
    if (pwdError) {
      return new Response(
        JSON.stringify({ message: pwdError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenHash = await sha256(token)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: rows, error: selectError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .limit(1)

    if (selectError || !rows?.length) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired reset link. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const row = rows[0]
    if (row.used_at) {
      return new Response(
        JSON.stringify({ message: 'This reset link has already been used. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const expiresAt = new Date(row.expires_at)
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({ message: 'This reset link has expired. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(row.user_id, {
      password: newPassword,
    })

    if (updateError) {
      console.error('auth.admin.updateUserById error:', updateError)
      return new Response(
        JSON.stringify({ message: 'Failed to update password. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', row.id)

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    await supabaseAdmin.from('audit_logs').insert({
      user_id: row.user_id,
      action: 'password_reset_used',
      details: { ip_address: ip, user_agent: userAgent },
    })

    return new Response(
      JSON.stringify({ message: 'Password has been reset successfully.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('auth-reset-password error:', err)
    return new Response(
      JSON.stringify({ message: 'An error occurred. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
