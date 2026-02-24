/**
 * Twilio Test - Verify credentials and send test SMS
 * POST body: { phoneNumber?: string } - optional, defaults to user's 2FA phone if enrolled
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 * Returns: { success: boolean, message: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const E164_REGEX = /^\+[1-9]\d{1,14}$/

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length >= 10) return `+${digits}`
  return `+1${digits}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!twilioSid || !twilioToken || !twilioPhone) {
      return new Response(
        JSON.stringify({ success: false, message: 'Twilio is not configured. Add TWILIO_* secrets.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.getUser(token)
    if (getUserError || !user?.id) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    let phoneNumber: string | null = null

    if (typeof body?.phoneNumber === 'string' && body.phoneNumber.trim()) {
      phoneNumber = normalizePhone(body.phoneNumber.trim())
      if (!E164_REGEX.test(phoneNumber)) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid phone number (use E.164 format, e.g. +1234567890)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      const { data: config } = await supabaseAdmin
        .from('user_2fa_config')
        .select('phone_number')
        .eq('user_id', user.id)
        .eq('method', 'sms')
        .single()
      phoneNumber = config?.phone_number ?? null
    }

    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ success: false, message: 'Provide a phone number or enroll SMS 2FA first' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`
    const twilioBody = new URLSearchParams({
      To: phoneNumber,
      From: twilioPhone,
      Body: 'Archject: Your Twilio integration is working. Test SMS successful.',
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
        JSON.stringify({
          success: false,
          message: (errData as { message?: string })?.message ?? 'Failed to send test SMS',
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Test SMS sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('twilio-test error:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
