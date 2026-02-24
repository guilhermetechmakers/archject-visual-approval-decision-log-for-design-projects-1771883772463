/**
 * Email Verification - Send Initial
 * Sends verification email after signup. Called by frontend when user signs up.
 * Invoke as auth-send-verification-email function.
 * Body: { userId: string } - requires Authorization Bearer (user's session) or service role
 * Requires: SENDGRID_API_KEY, APP_URL in Supabase secrets.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TOKEN_TTL_HOURS = 24

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
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : null

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: 'userId is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (!authUser?.user) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const createdAt = authUser.user.created_at ? new Date(authUser.user.created_at) : null
    if (createdAt && Date.now() - createdAt.getTime() > 15 * 60 * 1000) {
      return new Response(
        JSON.stringify({ success: false, message: 'Verification must be requested shortly after signup. Use resend instead.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, is_email_confirmed')
      .eq('id', userId)
      .maybeSingle()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, message: 'User not found.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (profile.is_email_confirmed) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email is already verified.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const plainToken = generateToken()
    const tokenHash = await sha256(plainToken)
    const jti = generateJti()
    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString()

    const { error: insertError } = await supabaseAdmin.from('verification_tokens').insert({
      user_id: userId,
      token_hash: tokenHash,
      token_jti: jti,
      expires_at: expiresAt,
    })

    if (insertError) {
      console.error('verification_tokens insert error:', insertError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create verification token.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabaseAdmin
      .from('profiles')
      .update({
        last_verification_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    const appUrl = Deno.env.get('APP_URL') ?? Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
    const verifyLink = `${appUrl.replace(/\/$/, '')}/verify?token=${encodeURIComponent(plainToken)}`

    const sendGridKey = Deno.env.get('SENDGRID_API_KEY')
    if (sendGridKey) {
      const sent = await sendVerificationEmail(profile.email, verifyLink, sendGridKey)
      if (!sent) {
        console.error('SendGrid email send failed')
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to send verification email.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      console.warn('SENDGRID_API_KEY not set - verification link (dev only):', verifyLink)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email sent. Please check your inbox.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('auth-send-verification-email error:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'An error occurred. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
