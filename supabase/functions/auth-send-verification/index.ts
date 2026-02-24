/**
 * Email Verification - Send / Resend Verification Email
 * Generates one-time verification token, stores hashed, sends email via SendGrid.
 * Body: { email } - email of user to send verification to
 * Rate limit: max 3 requests per user per 24 hours
 * Response: { success, cooldownSeconds?, message? }
 * Requires: SENDGRID_API_KEY, APP_URL in Supabase secrets.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TOKEN_TTL_HOURS = 24
const RATE_LIMIT_MAX_PER_24H = 3
const COOLDOWN_SECONDS = 900 // 15 minutes between resends when rate limited

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

function generateJti(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sendVerificationEmail(
  to: string,
  verificationLink: string,
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
      subject: 'Verify your Archject email address',
      content: [
        {
          type: 'text/plain',
          value: `Welcome to Archject!\n\nPlease verify your email address by clicking the link below:\n${verificationLink}\n\nThe link expires in ${TOKEN_TTL_HOURS} hours.\n\nIf you didn't create an account, you can safely ignore this email.`,
        },
        {
          type: 'text/html',
          value: `<!DOCTYPE html><html><body style="font-family: Inter, sans-serif; line-height: 1.6; color: #23272F;"><div style="max-width: 480px; margin: 0 auto; padding: 24px;"><h1 style="color: #195C4A; font-size: 24px;">Verify your email</h1><p>Welcome to Archject! Please verify your email address by clicking the button below.</p><p style="margin: 24px 0;"><a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: #195C4A; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify email address</a></p><p style="color: #6B7280; font-size: 14px;">The link expires in ${TOKEN_TTL_HOURS} hours.</p><p style="color: #6B7280; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p></div></body></html>`,
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
    let email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const requestToken = typeof body?.token === 'string' ? body.token.trim() : ''

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    let user: { id: string; email?: string; email_confirmed_at?: string | null } | null = null

    if (requestToken && requestToken.length >= 10) {
      const tokenHash = await sha256(requestToken)
      const { data: tokenRows } = await supabaseAdmin
        .from('email_verification_tokens')
        .select('user_id')
        .eq('token_hash', tokenHash)
        .limit(1)
      if (tokenRows?.length) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(tokenRows[0].user_id)
        if (authUser?.user) {
          user = authUser.user
          email = user.email?.toLowerCase() ?? ''
        }
      }
    }

    if (!user && email) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
      user = users?.users?.find((u) => u.email?.toLowerCase() === email) ?? null
    }

    if (!user) {
      return new Response(
        JSON.stringify({
          success: true,
          cooldownSeconds: 60,
          message: 'If an account exists with that email, you will receive a verification link shortly.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    email = user.email?.toLowerCase() ?? ''

    // Check if already verified
    if (user.email_confirmed_at) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Your email is already verified. You can sign in.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate limit: max 3 per 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabaseAdmin
      .from('email_verification_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo)

    if (countError) {
      console.error('Rate limit check error:', countError)
    }

    if ((count ?? 0) >= RATE_LIMIT_MAX_PER_24H) {
      return new Response(
        JSON.stringify({
          success: false,
          cooldownSeconds: COOLDOWN_SECONDS,
          message: `You've reached the maximum number of verification emails. Please try again in 24 hours.`,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const newToken = generateToken()
    const tokenHash = await sha256(newToken)
    const jti = generateJti()
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString()
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    const { error: insertError } = await supabaseAdmin
      .from('email_verification_tokens')
      .insert({
        user_id: user.id,
        token_hash: tokenHash,
        token_jti: jti,
        expires_at: expiresAt,
        created_by_ip: ip,
        user_agent: userAgent,
      })

    if (insertError) {
      console.error('email_verification_tokens insert error:', insertError)
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to create verification token. Please try again later.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'email_verification_sent',
      details: { ip_address: ip, user_agent: userAgent },
    })

    const appUrl = Deno.env.get('APP_URL') ?? Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
    const verificationLink = `${appUrl.replace(/\/$/, '')}/auth/verify?token=${newToken}`

    const sendGridKey = Deno.env.get('SENDGRID_API_KEY')
    if (sendGridKey) {
      const sent = await sendVerificationEmail(user.email!, verificationLink, sendGridKey)
      if (!sent) console.error('SendGrid email send failed')
    } else {
      console.warn('SENDGRID_API_KEY not set - verification link (dev only):', verificationLink)
    }

    return new Response(
      JSON.stringify({
        success: true,
        cooldownSeconds: 60,
        message: 'A verification email has been sent. Please check your inbox.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('auth-send-verification error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred. Please try again later.',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
