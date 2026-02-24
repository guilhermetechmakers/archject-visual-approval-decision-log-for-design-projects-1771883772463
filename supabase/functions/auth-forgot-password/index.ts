/**
 * Password Reset - Forgot Password
 * POST /auth/forgot-password (invoke as auth-forgot-password function)
 * Generates time-limited token, stores hashed, sends email via SendGrid.
 * Body: { email, workspace_id? }
 * Requires: SENDGRID_API_KEY, APP_URL (reset link base) in Supabase secrets.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TOKEN_TTL_MINUTES = 60

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sendResetEmail(
  to: string,
  resetLink: string,
  apiKey: string
): Promise<boolean> {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: {
        email: Deno.env.get('SENDGRID_FROM_EMAIL') ?? 'noreply@archject.com',
        name: Deno.env.get('SENDGRID_FROM_NAME') ?? 'Archject',
      },
      subject: 'Reset your Archject password',
      content: [
        {
          type: 'text/plain',
          value: `Someone requested a password reset for your Archject account.\n\nIf this was you, click the link below to reset your password:\n${resetLink}\n\nThe link expires in ${TOKEN_TTL_MINUTES} minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
        },
        {
          type: 'text/html',
          value: `<!DOCTYPE html><html><body><p>Someone requested a password reset for your Archject account.</p><p>If this was you, <a href="${resetLink}">click here to reset your password</a>.</p><p>The link expires in ${TOKEN_TTL_MINUTES} minutes.</p><p>If you didn't request this, you can safely ignore this email.</p></body></html>`,
        },
      ],
    }),
  })
  return res.ok
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
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email) {
      return new Response(
        JSON.stringify({ message: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const user = data?.users?.find((u) => u.email?.toLowerCase() === email)
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'If an account exists with that email, you will receive a password reset link shortly.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = generateToken()
    const tokenHash = await sha256(token)
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString()
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_by_ip: ip,
        user_agent: userAgent,
      })

    if (insertError) {
      console.error('password_reset_tokens insert error:', insertError)
      return new Response(
        JSON.stringify({ message: 'If an account exists with that email, you will receive a password reset link shortly.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'password_reset_requested',
      details: { ip_address: ip, user_agent: userAgent },
    })

    const appUrl = Deno.env.get('APP_URL') ?? Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
    const resetLink = `${appUrl.replace(/\/$/, '')}/auth/reset-password/${token}`

    const sendGridKey = Deno.env.get('SENDGRID_API_KEY')
    if (sendGridKey) {
      const sent = await sendResetEmail(user.email!, resetLink, sendGridKey)
      if (!sent) console.error('SendGrid email send failed')
    } else {
      console.warn('SENDGRID_API_KEY not set - reset link (dev only):', resetLink)
    }

    return new Response(
      JSON.stringify({
        message: 'If an account exists with that email, you will receive a password reset link shortly.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('auth-forgot-password error:', err)
    return new Response(
      JSON.stringify({ message: 'An error occurred. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
