/**
 * Password Reset - Forgot Password
 * POST /functions/v1/forgot-password
 * Creates a time-limited, single-use reset token, stores hash in DB, sends email via SendGrid.
 * Requires: SENDGRID_API_KEY, APP_URL (e.g. https://app.example.com) in Supabase secrets.
 * Body: { email, workspace_id? }
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
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
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
        name: 'Archject',
      },
      subject: 'Reset your Archject password',
      content: [
        {
          type: 'text/plain',
          value: `Someone requested a password reset for your Archject account. If this was you, click the link below to reset your password:\n\n${resetLink}\n\nThis link expires in ${TOKEN_TTL_MINUTES} minutes. If you didn't request this, you can safely ignore this email.`,
        },
        {
          type: 'text/html',
          value: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset your password</title></head>
<body style="font-family: Inter, system-ui, sans-serif; line-height: 1.6; color: #23272F;">
  <p>Someone requested a password reset for your Archject account.</p>
  <p>If this was you, <a href="${resetLink}" style="color: #195C4A;">click here to reset your password</a>.</p>
  <p>This link expires in ${TOKEN_TTL_MINUTES} minutes.</p>
  <p>If you didn't request this, you can safely ignore this email.</p>
  <p style="margin-top: 24px; color: #6B7280; font-size: 14px;">— Archject</p>
</body>
</html>`,
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

  try {
    const body = await req.json().catch(() => ({}))
    const email = (body.email ?? '').toString().trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ message: 'Please enter a valid email address.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find((u) => u.email?.toLowerCase() === email)
    if (!user) {
      return new Response(
        JSON.stringify({
          message: 'If an account exists with that email, you will receive a password reset link shortly.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rawToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '')
    const tokenHash = await sha256(rawToken)
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000)

    const { error: insertError } = await supabase.from('password_reset_tokens').insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      created_by_ip: req.headers.get('x-forwarded-for') ?? req.headers.get('cf-connecting-ip') ?? null,
      user_agent: req.headers.get('user-agent') ?? null,
    })

    if (insertError) {
      console.error('password_reset_tokens insert error:', insertError)
      return new Response(
        JSON.stringify({ message: 'If an account exists with that email, you will receive a password reset link shortly.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'
    const resetLink = `${appUrl}/auth/reset-password/${rawToken}`

    const sendGridKey = Deno.env.get('SENDGRID_API_KEY')
    if (sendGridKey) {
      const sent = await sendResetEmail(email, resetLink, sendGridKey)
      if (!sent) {
        console.error('SendGrid email failed for', email)
      }
    } else {
      console.warn('SENDGRID_API_KEY not set - reset link would be:', resetLink)
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'password_reset_requested',
      timestamp: new Date().toISOString(),
      details: {
        ip: req.headers.get('x-forwarded-for') ?? req.headers.get('cf-connecting-ip'),
        user_agent: req.headers.get('user-agent'),
      },
    })

    return new Response(
      JSON.stringify({
        message: 'If an account exists with that email, you will receive a password reset link shortly.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('forgot-password error:', err)
    return new Response(
      JSON.stringify({ message: 'Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
