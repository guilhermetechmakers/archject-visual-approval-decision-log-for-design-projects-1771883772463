/**
 * Decision Log Exports - Get status and download URL
 * GET ?exportId=xxx - returns status, progress, artifactUrl
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

  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let exportId: string | null = null
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      exportId = body.exportId ?? null
    } catch {
      exportId = null
    }
  } else {
    const url = new URL(req.url)
    exportId = url.searchParams.get('exportId')
  }
  if (!exportId) {
    return new Response(
      JSON.stringify({ success: false, message: 'Missing exportId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

  const { data: exportRow, error } = await supabase
    .from('decision_exports')
    .select('id, project_id, status, progress, artifact_url, artifact_size, error_message, format, created_at')
    .eq('id', exportId)
    .single()

  if (error || !exportRow) {
    return new Response(
      JSON.stringify({ success: false, message: 'Export not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const exp = exportRow as Record<string, unknown>
  const projectId = exp.project_id as string

  const { data: proj } = await supabase
    .from('projects')
    .select('workspace_id')
    .eq('id', projectId)
    .single()

  if (!proj) {
    return new Response(
      JSON.stringify({ success: false, message: 'Project not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: uwl } = await supabase
    .from('user_workspace_links')
    .select('user_id')
    .eq('workspace_id', proj.workspace_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!uwl) {
    return new Response(
      JSON.stringify({ success: false, message: 'Not authorized' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      exportId: exp.id,
      status: exp.status,
      progress: exp.progress ?? 0,
      artifactUrl: exp.artifact_url ?? null,
      artifactSize: exp.artifact_size ?? null,
      errorMessage: exp.error_message ?? null,
      format: exp.format,
      createdAt: exp.created_at,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
