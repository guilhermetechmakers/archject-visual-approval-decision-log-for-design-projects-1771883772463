/**
 * Email Verification - Resend
 * Sends a new verification email with rate limiting (max 3 per 24h per user).
 * Invoke as auth-resend-verification function.
 * Body: { email?: string, token?: string }
 * Requires: SENDGRID_API_KEY, APP_URL in Supabase secrets.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TOKEN_TTL_HOURS = 24
const MAX_RESENDS_PER_24H = 3
const COOLDOWN_MINUTES = 15

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
  return crypto.randomUUID()
}

async function sendVerificationEmail(
  to: string,
  verifyLink: string,
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
          value: `Welcome to Archject!\n\nPlease verify your email address by clicking the link below:\n${verifyLink}\n\nThe link expires in ${TOKEN_TTL_HOURS} hours.\n\nIf you didn't create an account, you can safely ignore this email.`,
        },
        {
          type: 'text/html',
          value: `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;line-height:1.6;color:#23272F"><p>Welcome to Archject!</p><p>Please verify your email address by <a href="${verifyLink}" style="color:#195C4A;font-weight:600">clicking here</a>.</p><p>The link expires in ${TOKEN_TTL_HOURS} hours.</p><p>If you didn't create an account, you can safely ignore this email.</p></body></html>`,
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
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : null
    const token = typeof body?.token === 'string' ? body.token.trim() : null

    if (!email && !token) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Email or token is required.',
          cooldownSeconds: COOLDOWN_MINUTES * 60,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    let userId: string | null = null
    let userEmail: string | null = null

    if (email) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .maybeSingle()
      if (profile) {
        userId = profile.id
        userEmail = profile.email
      }
    } else if (token && token.length >= 10) {
      const tokenHash = await sha256(token)
      const { data: tokenRow } = await supabaseAdmin
        .from('verification_tokens')
        .select('user_id')
        .eq('token_hash', tokenHash)
        .maybeSingle()
      if (tokenRow) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .eq('id', tokenRow.user_id)
          .maybeSingle()
        if (profile) {
          userId = profile.id
          userEmail = profile.email
        }
      }
    }

    if (!userId || !userEmail) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'If an account exists with that email, you will receive a verification link shortly.',
          cooldownSeconds: COOLDOWN_MINUTES * 60,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_email_confirmed, last_verification_requested_at')
      .eq('id', userId)
      .single()

    if (profile?.is_email_confirmed) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Your email is already verified. You can sign in.',
          cooldownSeconds: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const lastRequested = profile?.last_verification_requested_at
      ? new Date(profile.last_verification_requested_at)
      : null
    const now = new Date()
    const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const { count } = await supabaseAdmin
      .from('verification_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', windowStart.toISOString())

    if ((count ?? 0) >= MAX_RESENDS_PER_24H) {
      const nextAllowed = lastRequested
        ? new Date(lastRequested.getTime() + 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + COOLDOWN_MINUTES * 60 * 1000)
      const cooldownSeconds = Math.max(0, Math.ceil((nextAllowed.getTime() - now.getTime()) / 1000))

      return new Response(
        JSON.stringify({
          success: false,
          message: `You've reached the maximum number of verification emails. Please wait before requesting another.`,
          cooldownSeconds,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (lastRequested && (now.getTime() - lastRequested.getTime()) < COOLDOWN_MINUTES * 60 * 1000) {
      const cooldownSeconds = Math.ceil(
        (COOLDOWN_MINUTES * 60) - (now.getTime() - lastRequested.getTime()) / 1000
      )
      return new Response(
        JSON.stringify({
          success: false,
          message: `Please wait ${Math.ceil(cooldownSeconds / 60)} minutes before requesting another verification email.`,
          cooldownSeconds,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const plainToken = generateToken()
    const tokenHash = await sha256(plainToken)
    const jti = generateJti()
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString()
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    const { error: insertError } = await supabaseAdmin.from('verification_tokens').insert({
      user_id: userId,
      token_hash: tokenHash,
      token_jti: jti,
      expires_at: expiresAt,
      created_by_ip: ip,
      user_agent: userAgent,
    })

    if (insertError) {
      console.error('verification_tokens insert error:', insertError)
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to create verification link. Please try again.',
          cooldownSeconds: COOLDOWN_MINUTES * 60,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabaseAdmin
      .from('profiles')
      .update({
        last_verification_requested_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', userId)

    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action: 'verification_email_resent',
      details: { ip_address: ip, user_agent: userAgent },
    })

    const appUrl = Deno.env.get('APP_URL') ?? Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
    const verifyLink = `${appUrl.replace(/\/$/, '')}/verify?token=${encodeURIComponent(plainToken)}`

    const sendGridKey = Deno.env.get('SENDGRID_API_KEY')
    if (sendGridKey) {
      const sent = await sendVerificationEmail(userEmail, verifyLink, sendGridKey)
      if (!sent) console.error('SendGrid email send failed')
    } else {
      console.warn('SENDGRID_API_KEY not set - verification link (dev only):', verifyLink)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'A new verification email has been sent. Please check your inbox.',
        cooldownSeconds: COOLDOWN_MINUTES * 60,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('auth-resend-verification error:', err)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'An error occurred. Please try again later.',
        cooldownSeconds: COOLDOWN_MINUTES * 60,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
