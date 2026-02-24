/**
 * Integrations Connect - Initiate OAuth flow for Google Calendar, Forge, Zapier
 * POST body: { provider, projectId?, workspaceId? }
 * Returns: { success, authUrl?, message? }
 * Google Calendar: OAuth 2.0; Forge: API key exchange; Zapier: webhook URL
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

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let body: { provider?: string; projectId?: string; workspaceId?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid JSON' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const provider = body.provider
  if (!provider || !['google_calendar', 'autodesk_forge', 'zapier'].includes(provider)) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid provider' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (provider === 'google_calendar') {
    const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID')
    const redirectUri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI') ?? `${Deno.env.get('SITE_URL') ?? ''}/auth/callback/google`
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
    ].join(' ')
    const state = btoa(JSON.stringify({ userId: user.id, provider, projectId: body.projectId, workspaceId: body.workspaceId }))

    if (!clientId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Google OAuth not configured. Set GOOGLE_OAUTH_CLIENT_ID.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`

    return new Response(
      JSON.stringify({ success: true, authUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (provider === 'autodesk_forge') {
    return new Response(
      JSON.stringify({ success: false, message: 'Forge: Configure client ID/secret in Supabase secrets and add callback handler.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (provider === 'zapier') {
    return new Response(
      JSON.stringify({ success: false, message: 'Zapier: Add webhook URL in Settings → Webhooks.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Unknown provider' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
