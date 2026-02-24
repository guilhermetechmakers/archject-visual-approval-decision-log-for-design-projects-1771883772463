/**
 * Twilio Integration - Test credentials
 * POST /integrations/twilio/test
 * Body: { accountSid?, authToken?, fromNumber? } - or uses TWILIO_* secrets
 * Sends a test SMS to verify credentials.
 * Docs: https://www.twilio.com/docs/sms
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function basicAuth(accountSid: string, authToken: string): string {
  return btoa(`${accountSid}:${authToken}`)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ message: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      accountSid?: string
      authToken?: string
      fromNumber?: string
    }
    const accountSid = body.accountSid ?? Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = body.authToken ?? Deno.env.get('TWILIO_AUTH_TOKEN')
    const fromNumber = body.fromNumber ?? Deno.env.get('TWILIO_FROM_NUMBER')

    if (!accountSid || !authToken) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'accountSid and authToken required. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN secrets or pass in body.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const toNumber = body.fromNumber ?? fromNumber ?? '+15551234567'
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

    const formData = new URLSearchParams()
    formData.set('To', toNumber)
    formData.set('From', fromNumber ?? toNumber)
    formData.set('Body', 'Archject Twilio integration test')

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth(accountSid, authToken)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const data = await res.json().catch(() => ({})) as { sid?: string; message?: string }

    if (res.ok && data.sid) {
      return new Response(
        JSON.stringify({ success: true, message: 'Twilio credentials are valid', sid: data.sid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: data.message ?? `Twilio error: ${res.status} ${res.statusText}`,
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
