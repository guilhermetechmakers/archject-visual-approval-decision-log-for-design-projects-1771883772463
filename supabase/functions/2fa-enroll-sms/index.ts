/**
 * 2FA Enroll SMS - Send OTP via Twilio to phone number
 * POST body: { phoneNumber: string } (E.164 format)
 * Requires: Authorization: Bearer <access_token>
 * Rate limited: 5 per hour per user
 * Secrets: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const E164_REGEX = /^\+[1-9]\d{1,14}$/
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('1') === false) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  return input.startsWith('+') ? input : `+${input}`
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
    const body = await req.json() as { phoneNumber?: string }
    const raw = typeof body?.phoneNumber === 'string' ? body.phoneNumber.trim() : ''
    const phoneNumber = normalizePhone(raw)

    if (!E164_REGEX.test(phoneNumber)) {
      return new Response(
        JSON.stringify({ message: 'Please enter a valid phone number in E.164 format (e.g. +1234567890)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioFrom = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioSid || !twilioToken || !twilioFrom) {
      return new Response(
        JSON.stringify({ message: 'SMS verification is not configured. Please use the authenticator app instead.', smsAvailable: false }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: existing } = await supabaseAdmin
      .from('user_2fa_config')
      .select('is_enabled')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing?.is_enabled) {
      return new Response(
        JSON.stringify({ message: '2FA is already enabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
    const { count } = await supabaseAdmin
      .from('otp_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('method', 'sms_enroll')
      .gte('created_at', since)

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ message: 'Too many SMS requests. Try again in an hour.', cooldownSeconds: 3600 }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    await supabaseAdmin.from('otp_attempts').insert({
      user_id: user.id,
      method: 'sms_enroll',
      ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip'),
      success: true,
    })

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`
    const twilioBody = new URLSearchParams({
      To: phoneNumber,
      From: twilioFrom,
      Body: `Your Archject verification code is: ${otp}. Valid for 10 minutes.`,
    })

    const twilioRes = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(`${twilioSid}:${twilioToken}`),
      },
      body: twilioBody.toString(),
    })

    if (!twilioRes.ok) {
      const errText = await twilioRes.text()
      console.error('Twilio error:', errText)
      return new Response(
        JSON.stringify({ message: 'Failed to send verification code. Please try again later.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const otpHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(otp + user.id + 'sms_pending')
    )
    const otpHashHex = Array.from(new Uint8Array(otpHash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await supabaseAdmin.from('sms_otp_pending').upsert(
      {
        user_id: user.id,
        otp_hash: otpHashHex,
        expires_at: expiresAt,
      },
      { onConflict: 'user_id' }
    )

    await supabaseAdmin.from('user_2fa_config').upsert(
      {
        user_id: user.id,
        is_enabled: false,
        method: 'sms',
        totp_secret: null,
        phone_number: phoneNumber,
        phone_verified_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification code sent',
        smsSent: true,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('2fa-enroll-sms error:', err)
    return new Response(
      JSON.stringify({ message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
