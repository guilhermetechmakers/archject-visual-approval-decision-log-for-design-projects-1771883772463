/**
 * Decision Log Exports - Create export job
 * POST body: { projectId, scope, decisionIds?, format, brandingProfileId?, includeSignatures?, includeAttachments? }
 * Creates export record, fetches data, builds artifact, uploads to storage
 * Integrates: CSV/JSON builders, PDF generation via DocRaptor (optional)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildCSV, buildJSON, buildPDFHtml, type ExportData } from '../_shared/export-builders.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateExportRequest {
  projectId: string
  scope: 'project' | 'decision'
  decisionIds?: string[]
  format: 'PDF' | 'CSV' | 'JSON'
  brandingProfileId?: string
  includeSignatures?: boolean
  includeAttachments?: boolean
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

  let body: CreateExportRequest
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { projectId, scope, decisionIds = [], format, brandingProfileId, includeAttachments = true } = body
  if (!projectId || !format) {
    return new Response(
      JSON.stringify({ success: false, message: 'Missing projectId or format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!['PDF', 'CSV', 'JSON'].includes(format)) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid format' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Verify project access
  const { data: proj } = await supabase
    .from('projects')
    .select('id, workspace_id')
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
      JSON.stringify({ success: false, message: 'Not authorized for this project' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Resolve decision IDs
  let targetDecisionIds: string[] = []
  if (scope === 'decision' && decisionIds.length > 0) {
    const { data: decs } = await supabase
      .from('decisions')
      .select('id')
      .eq('project_id', projectId)
      .in('id', decisionIds)
    targetDecisionIds = (decs ?? []).map((d: { id: string }) => d.id)
  } else {
    const { data: decs } = await supabase
      .from('decisions')
      .select('id')
      .eq('project_id', projectId)
      .is('deleted_at', null)
    targetDecisionIds = (decs ?? []).map((d: { id: string }) => d.id)
  }

  if (targetDecisionIds.length === 0) {
    return new Response(
      JSON.stringify({ success: false, message: 'No decisions to export' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create export record
  const { data: exportRow, error: insertErr } = await supabase
    .from('decision_exports')
    .insert({
      project_id: projectId,
      scope,
      decision_ids: targetDecisionIds,
      format,
      status: 'processing',
      progress: 0,
      request_payload: body,
      branding_profile_id: brandingProfileId || null,
      include_attachments: includeAttachments ?? true,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (insertErr) {
    return new Response(
      JSON.stringify({ success: false, message: insertErr.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const exportId = exportRow.id

  try {
    await supabase.from('decision_exports').update({ progress: 10 }).eq('id', exportId)

    // Fetch decisions
    const { data: decisions } = await supabase
      .from('decisions')
      .select('*')
      .in('id', targetDecisionIds)

    const decRows = (decisions ?? []) as Record<string, unknown>[]

    const exportDecisions = decRows.map((d) => ({
      id: d.id as string,
      title: d.title as string,
      description: (d.description as string) ?? null,
      status: d.status as string,
      created_at: d.created_at as string,
      updated_at: d.updated_at as string,
      due_date: (d.due_date as string) ?? null,
      project_id: d.project_id as string,
    }))

    await supabase.from('decision_exports').update({ progress: 30 }).eq('id', exportId)

    // Fetch options
    const { data: options } = await supabase
      .from('decision_options')
      .select('*')
      .in('decision_id', targetDecisionIds)

    const optRows = (options ?? []) as Record<string, unknown>[]
    const exportOptions = optRows.map((o) => ({
      id: o.id as string,
      decision_id: o.decision_id as string,
      title: o.title as string,
      description: (o.description as string) ?? null,
      position: (o.position as number) ?? 0,
      is_recommended: (o.is_recommended as boolean) ?? false,
    }))

    // Fetch comments with author names
    const { data: comments } = await supabase
      .from('decision_comments')
      .select('id, decision_id, user_id, text, created_at, edited_at')
      .in('decision_id', targetDecisionIds)

    const cmtRows = (comments ?? []) as Record<string, unknown>[]
    const userIds = [...new Set(cmtRows.map((c) => c.user_id).filter(Boolean))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)

    const profileMap = new Map(((profiles ?? []) as { id: string; full_name?: string }[]).map((p) => [p.id, p.full_name ?? '']))
    const exportComments = cmtRows.map((c) => ({
      id: c.id as string,
      decision_id: c.decision_id as string,
      author_name: profileMap.get(c.user_id as string) ?? null,
      text: c.text as string,
      created_at: c.created_at as string,
      edited_at: (c.edited_at as string) ?? null,
    }))

    // Fetch approvals
    const { data: approvals } = await supabase
      .from('decision_approvals')
      .select('*')
      .in('decision_id', targetDecisionIds)

    const apprRows = (approvals ?? []) as Record<string, unknown>[]
    const approverIds = [...new Set(apprRows.map((a) => a.user_id).filter(Boolean))]
    const { data: apprProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', approverIds)

    const apprProfileMap = new Map(((apprProfiles ?? []) as { id: string; full_name?: string }[]).map((p) => [p.id, p.full_name ?? '']))
    const exportApprovals = apprRows.map((a) => ({
      id: a.id as string,
      decision_id: a.decision_id as string,
      approver_name: apprProfileMap.get(a.user_id as string) ?? null,
      role: (a.role as string) ?? 'approver',
      status: a.status as string,
      timestamp: a.timestamp as string,
      comments: (a.comments as string) ?? null,
    }))

    // Fetch attachments
    const { data: attachments } = includeAttachments
      ? await supabase
          .from('decision_attachments')
          .select('*')
          .in('decision_id', targetDecisionIds)
      : { data: [] }

    const attRows = (attachments ?? []) as Record<string, unknown>[]
    const exportAttachments = attRows.map((a) => ({
      id: a.id as string,
      decision_id: a.decision_id as string,
      filename: a.filename as string,
      url: a.url as string,
      mime_type: (a.mime_type as string) ?? null,
      version: (a.version as number) ?? 1,
    }))

    await supabase.from('decision_exports').update({ progress: 60 }).eq('id', exportId)

    const exportData: ExportData = {
      decisions: exportDecisions,
      options: exportOptions,
      comments: exportComments,
      approvals: exportApprovals,
      attachments: exportAttachments,
      metadata: {
        project_id: projectId,
        export_id: exportId,
        export_timestamp: new Date().toISOString(),
        export_version: '1.0',
      },
    }

    let content: string | Uint8Array
    let contentType: string
    let ext: string

    if (format === 'CSV') {
      content = buildCSV(exportData)
      contentType = 'text/csv'
      ext = 'csv'
    } else if (format === 'JSON') {
      content = buildJSON(exportData)
      contentType = 'application/json'
      ext = 'json'
    } else {
      // PDF - build HTML for DocRaptor or client-side print
      let branding: { logo_url?: string; primary_color?: string } | undefined
      if (brandingProfileId) {
        const { data: bp } = await supabase
          .from('branding_profiles')
          .select('logo_url, primary_color')
          .eq('id', brandingProfileId)
          .single()
        if (bp) branding = bp as { logo_url?: string; primary_color?: string }
      }
      const htmlContent = buildPDFHtml(exportData, branding)
      contentType = 'text/html'
      ext = 'html'
      content = htmlContent

      const docRaptorKey = Deno.env.get('DOCRAPTOR_API_KEY')
      if (docRaptorKey) {
        try {
          const pdfRes = await fetch('https://docraptor.com/docs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${btoa(docRaptorKey + ':')}`,
            },
            body: JSON.stringify({
              doc: { content_type: 'html', document_content: htmlContent },
              document_type: 'pdf',
              name: `decision-log-${exportId}.pdf`,
            }),
          })
          if (pdfRes.ok) {
            const pdfBuffer = await pdfRes.arrayBuffer()
            contentType = 'application/pdf'
            ext = 'pdf'
            content = new Uint8Array(pdfBuffer)
          }
        } catch {
          // Fallback to HTML
        }
      }
    }

    await supabase.from('decision_exports').update({ progress: 85 }).eq('id', exportId)

    // Upload to storage
    const storageKey = `exports/${projectId}/${exportId}.${ext}`
    const buffer =
      typeof content === 'string'
        ? new TextEncoder().encode(content)
        : content

    const { data: bucketList } = await supabase.storage.listBuckets()
    const hasExports = bucketList?.some((b) => b.name === 'exports')
    if (!hasExports) {
      await supabase.storage.createBucket('exports', { public: false })
    }

    const { error: uploadErr } = await supabase.storage
      .from('exports')
      .upload(storageKey, buffer, {
        contentType: format === 'PDF' && contentType === 'application/pdf' ? 'application/pdf' : contentType,
        upsert: true,
      })

    if (uploadErr) {
      await supabase
        .from('decision_exports')
        .update({ status: 'failed', error_message: uploadErr.message })
        .eq('id', exportId)
      return new Response(
        JSON.stringify({ success: false, message: 'Upload failed: ' + uploadErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: signedUrl } = await supabase.storage
      .from('exports')
      .createSignedUrl(storageKey, 3600) // 1 hour

    const artifactUrl = signedUrl?.signedUrl ?? signedUrl?.signed_url ?? null

    await supabase
      .from('decision_exports')
      .update({
        status: 'completed',
        progress: 100,
        artifact_url: artifactUrl,
        artifact_size: buffer.byteLength,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', exportId)

    return new Response(
      JSON.stringify({
        success: true,
        exportId,
        status: 'completed',
        progress: 100,
        artifactUrl,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Export failed'
    await supabase
      .from('decision_exports')
      .update({ status: 'failed', error_message: msg })
      .eq('id', exportId)

    return new Response(
      JSON.stringify({ success: false, message: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
