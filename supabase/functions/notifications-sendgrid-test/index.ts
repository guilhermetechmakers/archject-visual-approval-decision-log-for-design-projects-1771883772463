/**
 * SendGrid Test - Verify API key and send test email
 * POST body: { to?: string } - optional recipient, defaults to authenticated user email
 * Requires: SENDGRID_API_KEY (supabase secrets set)
 * Returns: { success: boolean, message: string }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const sendgridKey = Deno.env.get('SENDGRID_API_KEY')
    if (!sendgridKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'SendGrid is not configured. Add SENDGRID_API_KEY to secrets.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.getUser(token)
    if (getUserError || !user?.email) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const to = typeof body?.to === 'string' && body.to.includes('@') ? body.to : user.email

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sendgridKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: Deno.env.get('SENDGRID_FROM_EMAIL') ?? 'noreply@archject.app',
          name: Deno.env.get('SENDGRID_FROM_NAME') ?? 'Archject',
        },
        subject: 'Archject – SendGrid test',
        content: [
          {
            type: 'text/plain',
            value: 'This is a test email from Archject. Your SendGrid integration is working.',
          },
          {
            type: 'text/html',
            value: '<p>This is a test email from Archject. Your SendGrid integration is working.</p>',
          },
        ],
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('SendGrid error:', errData)
      return new Response(
        JSON.stringify({
          success: false,
          message: (errData as { errors?: { message?: string }[] })?.errors?.[0]?.message ?? 'Failed to send test email',
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Test email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('sendgrid-test error:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
