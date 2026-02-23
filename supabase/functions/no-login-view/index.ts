/**
 * Client Portal - No-login view
 * GET /api/decisions/no-login-view?token=...
 * Returns decision metadata, options, media, comments, annotations, branding
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
        JSON.stringify({ message: 'Token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Validate token and fetch decision (stub - implement with links table)
    const { data: link, error: linkError } = await supabase
      .from('client_links')
      .select('decision_id, expires_at, requires_otp')
      .eq('token', token)
      .single()

    if (linkError || !link) {
      return new Response(
        JSON.stringify({ message: 'Invalid or expired link' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ message: 'Link expired' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch decision, options, comments, annotations (stub - implement with real tables)
    const payload = {
      decision: { id: link.decision_id, title: '', projectId: '', createdAt: '', updatedAt: '' },
      options: [],
      mediaAssets: [],
      comments: [],
      annotations: [],
      branding: { logoUrl: null, accentColor: '#195C4A', domainPrefix: null, customDomain: null },
      linkExpiresAt: link.expires_at,
      requiresOtp: link.requires_otp ?? false,
    }

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
