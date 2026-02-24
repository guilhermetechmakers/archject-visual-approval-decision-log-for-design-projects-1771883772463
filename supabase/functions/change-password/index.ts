/**
 * Password Change - Authenticated flow
 * POST /functions/v1/change-password
 * Verifies current password, updates to new password, logs audit.
 * Requires: Authorization: Bearer <access_token>
 * Body: { current_password, new_password, confirm_password }
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.slice(7)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ message: 'Session expired. Please sign in again.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const currentPassword = (body.current_password ?? '').toString()
    const newPassword = (body.new_password ?? '').toString()
    const confirmPassword = (body.confirm_password ?? '').toString()

    if (!currentPassword) {
      return new Response(
        JSON.stringify({ message: 'Current password is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email ?? '',
      password: currentPassword,
    })

    if (signInError) {
      return new Response(
        JSON.stringify({ message: 'Current password is incorrect.' }),
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

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) {
      console.error('auth.admin.updateUserById error:', updateError)
      return new Response(
        JSON.stringify({ message: 'Failed to update password. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await adminClient.from('audit_logs').insert({
      user_id: user.id,
      action: 'password_changed',
      timestamp: new Date().toISOString(),
      details: {
        ip: req.headers.get('x-forwarded-for') ?? req.headers.get('cf-connecting-ip'),
        user_agent: req.headers.get('user-agent'),
      },
    })

    return new Response(
      JSON.stringify({ message: 'Password changed successfully.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('change-password error:', err)
    return new Response(
      JSON.stringify({ message: 'Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
