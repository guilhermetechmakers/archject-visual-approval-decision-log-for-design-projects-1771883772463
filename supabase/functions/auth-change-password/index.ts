/**
 * Password Change - Authenticated flow
 * POST /auth/change-password (invoke as auth-change-password function)
 * Requires Authorization: Bearer <session_token>
 * Verifies current password, updates to new password, logs audit event.
 * Body: { current_password, new_password, confirm_password }
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
    const body = await req.json()
    const currentPassword = typeof body?.current_password === 'string' ? body.current_password : ''
    const newPassword = typeof body?.new_password === 'string' ? body.new_password : ''
    const confirmPassword = typeof body?.confirm_password === 'string' ? body.confirm_password : ''

    if (!currentPassword) {
      return new Response(
        JSON.stringify({ message: 'Current password is required' }),
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: { user: tokenUser }, error: getUserError } = await supabaseAdmin.auth.getUser(token)
    if (getUserError || !tokenUser?.email) {
      return new Response(
        JSON.stringify({ message: 'Invalid session. Please sign in again.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user: verifyUser }, error: verifyError } = await createClient(supabaseUrl, supabaseAnonKey)
      .auth.signInWithPassword({
        email: tokenUser.email,
        password: currentPassword,
      })

    if (verifyError || !verifyUser || verifyUser.id !== tokenUser.id) {
      return new Response(
        JSON.stringify({ message: 'Current password is incorrect' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(tokenUser.id, {
      password: newPassword,
    })

    if (updateError) {
      console.error('auth.admin.updateUserById error:', updateError)
      return new Response(
        JSON.stringify({ message: 'Failed to update password. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    await supabaseAdmin.from('audit_logs').insert({
      user_id: tokenUser.id,
      action: 'password_changed',
      details: { ip_address: ip, user_agent: userAgent },
    })

    return new Response(
      JSON.stringify({ message: 'Password changed successfully.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('auth-change-password error:', err)
    return new Response(
      JSON.stringify({ message: 'An error occurred. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
