/**
 * Decision Log Exports - Get export status
 * GET /exports-status?exportId=...
 * Returns: { exportId, status, progress, artifactUrl, logs? }
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

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ message: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(
      JSON.stringify({ message: 'Authentication required' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const url = new URL(req.url)
  const exportId = url.searchParams.get('exportId')
  if (!exportId) {
    return new Response(
      JSON.stringify({ message: 'exportId required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(
      JSON.stringify({ message: 'Invalid token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: exp, error } = await supabase
    .from('decision_exports')
    .select('id, status, progress, artifact_url, artifact_size, error_message, created_at, completed_at')
    .eq('id', exportId)
    .single()

  if (error || !exp) {
    return new Response(
      JSON.stringify({ message: 'Export not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: logs } = await supabase
    .from('export_logs')
    .select('message, level, timestamp')
    .eq('export_id', exportId)
    .order('timestamp', { ascending: false })
    .limit(10)

  return new Response(
    JSON.stringify({
      exportId: exp.id,
      status: exp.status,
      progress: exp.progress ?? 0,
      artifactUrl: exp.artifact_url ?? null,
      artifactSize: exp.artifact_size ?? null,
      errorMessage: exp.error_message ?? null,
      createdAt: exp.created_at,
      completedAt: exp.completed_at ?? null,
      logs: logs ?? [],
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
