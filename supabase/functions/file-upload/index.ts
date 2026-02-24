/**
 * File Upload - Handles multipart file uploads for project files
 * POST: multipart/form-data with 'files' field
 * Query/params: projectId from path or body
 * Returns: { files: LibraryFile[] }
 * Integrates with Supabase Storage for raw files; supports hash for deduplication.
 * Uses project_files and file_versions tables.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/vnd.dwg',
  'application/zip',
  'application/octet-stream',
]
const MAX_SIZE = 100 * 1024 * 1024 // 100 MB

function inferFileType(mime: string, filename: string): string {
  if (mime.startsWith('image/')) return 'image'
  if (/\.(dwg|rvt|ifc)$/i.test(filename)) return 'BIM'
  if (/\.(pdf)$/i.test(filename) || mime === 'application/pdf') return 'drawing'
  if (/\.(xls|xlsx)$/i.test(filename)) return 'spec'
  return 'drawing'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
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
  const projectId = url.searchParams.get('projectId') ?? url.pathname.split('/').pop()

  if (!projectId) {
    return new Response(
      JSON.stringify({ message: 'projectId required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ message: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const hash = formData.get('hash') as string | null

    if (!files.length) {
      return new Response(
        JSON.stringify({ message: 'No files provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const results: Record<string, unknown>[] = []

    for (const file of files) {
      if (!(file instanceof File)) continue
      if (file.size > MAX_SIZE) {
        return new Response(
          JSON.stringify({ message: `File too large: ${file.name} (max 100 MB)` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const mime = file.type || 'application/octet-stream'
      const allowed = ALLOWED_MIME.includes(mime) || /\.(pdf|jpg|jpeg|png|gif|webp|svg|dwg|rvt|zip)$/i.test(file.name)
      if (!allowed) {
        return new Response(
          JSON.stringify({ message: `File type not allowed: ${file.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const ext = file.name.split('.').pop() ?? 'bin'
      const storagePath = `projects/${projectId}/files/${crypto.randomUUID()}.${ext}`

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )

      const { error: uploadError } = await supabaseAdmin.storage
        .from('project-files')
        .upload(storagePath, file, { upsert: false })

      if (uploadError) {
        return new Response(
          JSON.stringify({ message: `Upload failed: ${uploadError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: publicUrl } = supabaseAdmin.storage
        .from('project-files')
        .getPublicUrl(storagePath)

      const fileType = inferFileType(mime, file.name)

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('project_files')
        .insert({
          project_id: projectId,
          filename: file.name,
          size: file.size,
          mime_type: mime,
          storage_path: storagePath,
          uploaded_by: user.id,
          version: 1,
          hash: hash || null,
          file_type: fileType,
        })
        .select()
        .single()

      if (insertError) {
        await supabaseAdmin.storage.from('project-files').remove([storagePath])
        return new Response(
          JSON.stringify({ message: `Database error: ${insertError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      results.push({
        id: inserted.id,
        name: file.name,
        type: fileType,
        size: file.size,
        mimeType: mime,
        currentVersionId: inserted.id,
        uploadedBy: user.id,
        uploadedByName: user.user_metadata?.full_name ?? user.email,
        uploadedAt: inserted.uploaded_at,
        projectId,
        isDeleted: false,
        previewUrl: null,
        previewStatus: 'queued',
        cdnUrl: publicUrl.publicUrl,
        version: 1,
        linkedDecisionsCount: 0,
        linkedDecisions: [],
      })
    }

    return new Response(
      JSON.stringify({ files: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ message: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
