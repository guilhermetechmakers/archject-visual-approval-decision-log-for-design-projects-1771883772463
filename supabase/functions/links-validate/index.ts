/**
 * Client Portal - Validate share link token
 * GET /api/links/validate?token=...
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

  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    if (!token) {
      return new Response(
        JSON.stringify({ valid: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: link } = await supabase
      .from('client_links')
      .select('decision_id, expires_at, requires_otp')
      .eq('token', token)
      .single()

    if (!link) {
      return new Response(
        JSON.stringify({ valid: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const expired = link.expires_at && new Date(link.expires_at) < new Date()

    return new Response(
      JSON.stringify({
        valid: !expired,
        decisionId: link.decision_id,
        expiresAt: link.expires_at,
        requiresOtp: link.requires_otp,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ valid: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
