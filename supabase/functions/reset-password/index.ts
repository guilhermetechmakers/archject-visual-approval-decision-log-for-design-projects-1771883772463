/**
 * Password Reset - Reset Password
 * POST /functions/v1/reset-password
 * Validates token, updates user password via Supabase Auth, marks token used, logs audit.
 * Body: { token, new_password, confirm_password }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MIN_LENGTH = 12

function validatePassword(password: string): string | null {
  if (password.length < MIN_LENGTH) {
    return `Password must be at least ${MIN_LENGTH} characters`
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
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const token = (body.token ?? '').toString().trim()
    const newPassword = (body.new_password ?? '').toString()
    const confirmPassword = (body.confirm_password ?? '').toString()

    if (!token) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired reset link. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (newPassword !== confirmPassword) {
      return new Response(
        JSON.stringify({ message: 'Passwords do not match.' }),
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: rows, error: selectError } = await supabase
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

    const row = rows[0] as { id: string; user_id: string; expires_at: string; used_at: string | null }
    if (row.used_at) {
      return new Response(
        JSON.stringify({ message: 'This reset link has already been used. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new Date(row.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ message: 'This reset link has expired. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(row.user_id, {
      password: newPassword,
    })

    if (updateError) {
      console.error('auth.admin.updateUserById error:', updateError)
      return new Response(
        JSON.stringify({ message: 'Failed to update password. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', row.id)

    await supabase.from('audit_logs').insert({
      user_id: row.user_id,
      action: 'password_reset_used',
      timestamp: new Date().toISOString(),
      details: {
        ip: req.headers.get('x-forwarded-for') ?? req.headers.get('cf-connecting-ip'),
        user_agent: req.headers.get('user-agent'),
      },
    })

    return new Response(
      JSON.stringify({ message: 'Password has been reset successfully.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('reset-password error:', err)
    return new Response(
      JSON.stringify({ message: 'Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
