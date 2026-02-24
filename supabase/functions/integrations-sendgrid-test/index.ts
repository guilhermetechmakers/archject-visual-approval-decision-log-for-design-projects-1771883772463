/**
 * SendGrid Integration - Test API key
 * POST /integrations/sendgrid/test
 * Body: { apiKey } - API key to validate (or uses SENDGRID_API_KEY secret)
 * Sends a test email to verify credentials.
 * Docs: https://docs.sendgrid.com/api-reference/mail-send/mail-send
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const body = (await req.json().catch(() => ({}))) as { apiKey?: string }
    const apiKey = body.apiKey ?? Deno.env.get('SENDGRID_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No API key provided. Set SENDGRID_API_KEY secret or pass apiKey in body.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: 'test@example.com' }] }],
        from: { email: 'noreply@archject.app', name: 'Archject Test' },
        subject: 'SendGrid test from Archject',
        content: [{ type: 'text/plain', value: 'This is a test email to verify your SendGrid integration.' }],
      }),
    })

    if (res.ok) {
      return new Response(
        JSON.stringify({ success: true, message: 'SendGrid API key is valid' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const errText = await res.text()
    return new Response(
      JSON.stringify({
        success: false,
        message: `SendGrid error: ${res.status} ${res.statusText}`,
        detail: errText.slice(0, 200),
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
