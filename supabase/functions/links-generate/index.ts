/**
 * Client Portal - Generate share link
 * POST /api/links/generate
 * Body: { decisionId, expirySeconds?, requireOtp?, brandingOverride? }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateToken(): string {
  const array = new Uint8Array(32)
  globalThis.crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { decisionId, expirySeconds, requireOtp } = body

    if (!decisionId) {
      return new Response(
        JSON.stringify({ message: 'decisionId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = generateToken()
    const expiresAt = expirySeconds
      ? new Date(Date.now() + expirySeconds * 1000).toISOString()
      : null

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    await supabase.from('client_links').insert({
      token,
      decision_id: decisionId,
      expires_at: expiresAt,
      requires_otp: requireOtp ?? false,
    })

    const baseUrl = Deno.env.get('SITE_URL') ?? 'https://example.com'
    const url = `${baseUrl}/portal/${token}`

    return new Response(
      JSON.stringify({
        token,
        url,
        expiresAt,
        requireOtp: requireOtp ?? false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
