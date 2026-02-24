/**
 * Decision Log Exports - Get signed download URL
 * GET ?exportId=xxx - returns signed URL for artifact download
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
    .select('id, project_id, artifact_url, status, format')
    .eq('id', exportId)
    .single()

  if (error || !exportRow) {
    return new Response(
      JSON.stringify({ success: false, message: 'Export not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const exp = exportRow as Record<string, unknown>
  if (exp.status !== 'completed') {
    return new Response(
      JSON.stringify({ success: false, message: 'Export not ready for download' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const projectId = exp.project_id as string
  const format = (exp.format as string) ?? 'CSV'
  const extMap: Record<string, string> = { PDF: 'pdf', CSV: 'csv', JSON: 'json' }
  const ext = extMap[format] ?? 'csv'

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

  const artifactUrl = exp.artifact_url as string
  if (artifactUrl && artifactUrl.startsWith('http')) {
    return new Response(
      JSON.stringify({ success: true, downloadUrl: artifactUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const storageKey = `exports/${projectId}/${exportId}.${ext}`
  const bucketList = await supabase.storage.listBuckets()
  const hasExports = bucketList?.data?.some((b) => b.name === 'exports')
  const bucket = hasExports ? 'exports' : 'project-files'
  const { data: signed } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storageKey, 3600)

  const downloadUrl = signed?.signedUrl ?? signed?.signed_url
  if (!downloadUrl) {
    return new Response(
      JSON.stringify({ success: false, message: 'Download URL not available' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, downloadUrl }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
