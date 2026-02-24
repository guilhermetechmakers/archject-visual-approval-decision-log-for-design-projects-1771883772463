/**
 * 2FA Enroll SMS - Send OTP to phone via Twilio
 * Body: { phoneNumber: string } (E.164 format)
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 * Graceful fallback: returns error if Twilio not configured
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
  if (digits.length === 10 && digits.startsWith('2')) return `+${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (digits.length >= 10) return `+${digits}`
  return `+1${digits}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(JSON.stringify({ message: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const rawPhone = typeof body?.phoneNumber === 'string' ? body.phoneNumber.trim() : ''
    const phoneNumber = normalizePhone(rawPhone)

    if (!E164_REGEX.test(phoneNumber)) {
      return new Response(JSON.stringify({ message: 'Enter a valid phone number (E.164 format, e.g. +1234567890)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioSid || !twilioToken || !twilioPhone) {
      return new Response(
        JSON.stringify({ message: 'SMS verification is not configured. Please use authenticator app instead.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.getUser(token)
    if (getUserError || !user?.id) {
      return new Response(JSON.stringify({ message: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
    const { count } = await supabaseAdmin
      .from('otp_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since)

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return new Response(JSON.stringify({ message: 'Too many attempts. Try again in an hour.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`
    const twilioBody = new URLSearchParams({
      To: phoneNumber,
      From: twilioPhone,
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
      const errData = await twilioRes.json().catch(() => ({}))
      console.error('Twilio error:', errData)
      return new Response(
        JSON.stringify({ message: 'Failed to send SMS. Please try again later.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabaseAdmin.from('user_2fa_config').upsert(
      {
        user_id: user.id,
        is_enabled: false,
        method: 'sms',
        phone_number: phoneNumber,
        totp_secret: otp,
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
    console.error('two-fa-enroll-sms error:', err)
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
