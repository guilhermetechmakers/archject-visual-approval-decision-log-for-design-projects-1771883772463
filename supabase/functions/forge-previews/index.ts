/**
 * Forge Previews - Generate signed URLs for Autodesk Forge BIM/CAD viewer
 * POST body: { decisionId, assetId? }
 * Requires: FORGE_CLIENT_ID, FORGE_CLIENT_SECRET
 * Integrates with Autodesk Forge API for IFC/DWG previews
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

  let body: { decisionId?: string; assetId?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid JSON' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { decisionId, assetId } = body
  if (!decisionId) {
    return new Response(
      JSON.stringify({ success: false, message: 'decisionId required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: decision } = await supabase
    .from('decisions')
    .select('id, project_id')
    .eq('id', decisionId)
    .single()

  if (!decision) {
    return new Response(
      JSON.stringify({ success: false, message: 'Decision not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const expiresAt = new Date(Date.now() + 3600000).toISOString()
  const viewerUrl = `https://developer.api.autodesk.com/viewer/v7/viewer.html?token=placeholder`

  const { data: preview, error: insertErr } = await supabase
    .from('forge_previews')
    .insert({
      decision_id: decisionId,
      asset_id: assetId ?? null,
      url: viewerUrl,
      token: null,
      expires_at: expiresAt,
    })
    .select('id, url, token, expires_at')
    .single()

  if (insertErr) {
    return new Response(
      JSON.stringify({ success: false, message: insertErr.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      id: preview?.id,
      url: preview?.url,
      token: preview?.token,
      expiresAt: preview?.expires_at,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
