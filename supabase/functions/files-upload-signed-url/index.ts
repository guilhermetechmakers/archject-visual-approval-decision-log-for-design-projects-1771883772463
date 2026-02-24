/**
 * File Upload - Generate signed URL for Supabase Storage upload
 * Integrates with project_files and file_versions tables.
 * POST body: { projectId: string, filename: string, contentType: string, size: number, hash?: string }
 * Returns: { uploadUrl: string, fileId: string, versionId: string }
 * Client uploads via PUT to uploadUrl, then calls files-upload-complete.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_MIME_PREFIXES = [
  'application/pdf',
  'image/',
  'application/vnd.dwg',
  'application/zip',
  'application/octet-stream',
]
const MAX_SIZE_BYTES = 100 * 1024 * 1024 // 100 MB

function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME_PREFIXES.some(
    (p) => mime === p || (p.endsWith('/') && mime.startsWith(p))
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
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

  let body: { projectId?: string; filename?: string; contentType?: string; size?: number; hash?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { projectId, filename, contentType, size, hash } = body
  if (!projectId || !filename || !contentType || typeof size !== 'number') {
    return new Response(
      JSON.stringify({ success: false, message: 'Missing projectId, filename, contentType, or size' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (size > MAX_SIZE_BYTES) {
    return new Response(
      JSON.stringify({ success: false, message: `File size exceeds ${MAX_SIZE_BYTES / 1024 / 1024} MB limit` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!isAllowedMime(contentType)) {
    return new Response(
      JSON.stringify({ success: false, message: 'File type not allowed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const ext = filename.split('.').pop() ?? ''
  const storageKey = `projects/${projectId}/${crypto.randomUUID()}.${ext || 'bin'}`

  const { data: signedUrlData, error: signError } = await supabase.storage
    .from('project-files')
    .createSignedUploadUrl(storageKey)

  if (signError) {
    return new Response(
      JSON.stringify({ success: false, message: signError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: fileRow, error: insertError } = await supabase
    .from('project_files')
    .insert({
      project_id: projectId,
      filename,
      size,
      mime_type: contentType,
      storage_path: storageKey,
      uploaded_by: user.id,
      version: 1,
      hash: hash || null,
    })
    .select('id')
    .single()

  if (insertError) {
    return new Response(
      JSON.stringify({ success: false, message: insertError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: versionRow, error: versionError } = await supabase
    .from('file_versions')
    .insert({
      file_id: fileRow.id,
      version_number: 1,
      storage_key: storageKey,
      size,
      hash: hash || null,
      uploaded_by: user.id,
    })
    .select('id')
    .single()

  if (versionError) {
    await supabase.from('project_files').delete().eq('id', fileRow.id)
    return new Response(
      JSON.stringify({ success: false, message: versionError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      uploadUrl: signedUrlData?.signedUrl ?? signedUrlData?.signed_url,
      path: signedUrlData?.path ?? storageKey,
      fileId: fileRow.id,
      versionId: versionRow.id,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
