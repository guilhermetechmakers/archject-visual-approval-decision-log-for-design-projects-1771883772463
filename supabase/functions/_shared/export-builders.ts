/**
 * Decision Log Export builders - CSV, JSON, PDF HTML
 * Used by exports-create Edge Function
 */

export interface ExportDecision {
  id: string
  title: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
  due_date: string | null
  project_id: string
}

export interface ExportOption {
  id: string
  decision_id: string
  title: string
  description: string | null
  position: number
  is_recommended: boolean
}

export interface ExportComment {
  id: string
  decision_id: string
  author_name: string | null
  text: string
  created_at: string
  edited_at: string | null
}

export interface ExportApproval {
  id: string
  decision_id: string
  approver_name: string | null
  role: string
  status: string
  timestamp: string
  comments: string | null
}

export interface ExportAttachment {
  id: string
  decision_id: string
  filename: string
  url: string
  mime_type: string | null
  version: number
}

export interface ExportData {
  decisions: ExportDecision[]
  options: ExportOption[]
  comments: ExportComment[]
  approvals: ExportApproval[]
  attachments: ExportAttachment[]
  metadata: {
    project_id: string
    export_id: string
    export_timestamp: string
    export_version: string
  }
}

function escapeCsv(val: unknown): string {
  const s = String(val ?? '').replace(/"/g, '""')
  return `"${s}"`
}

export function buildCSV(data: ExportData): string {
  const rows: string[][] = []
  rows.push([
    'decision_id',
    'decision_title',
    'decision_status',
    'decision_created_at',
    'decision_updated_at',
    'option_id',
    'option_text',
    'option_rationale',
    'option_order',
    'comment_id',
    'comment_author',
    'comment_text',
    'comment_created_at',
    'approval_id',
    'approver',
    'approval_status',
    'approval_timestamp',
    'attachment_id',
    'file_name',
    'file_url',
  ])

  const optByDec = new Map<string, ExportOption[]>()
  for (const o of data.options) {
    const list = optByDec.get(o.decision_id) ?? []
    list.push(o)
    optByDec.set(o.decision_id, list)
  }
  const cmtByDec = new Map<string, ExportComment[]>()
  for (const c of data.comments) {
    const list = cmtByDec.get(c.decision_id) ?? []
    list.push(c)
    cmtByDec.set(c.decision_id, list)
  }
  const apprByDec = new Map<string, ExportApproval[]>()
  for (const a of data.approvals) {
    const list = apprByDec.get(a.decision_id) ?? []
    list.push(a)
    apprByDec.set(a.decision_id, list)
  }
  const attByDec = new Map<string, ExportAttachment[]>()
  for (const a of data.attachments) {
    const list = attByDec.get(a.decision_id) ?? []
    list.push(a)
    attByDec.set(a.decision_id, list)
  }

  for (const d of data.decisions) {
    const opts = optByDec.get(d.id) ?? []
    const comments = cmtByDec.get(d.id) ?? []
    const approvals = apprByDec.get(d.id) ?? []
    const attachments = attByDec.get(d.id) ?? []
    const maxRows = Math.max(
      opts.length || 1,
      comments.length || 1,
      approvals.length || 1,
      attachments.length || 1
    )
    for (let i = 0; i < maxRows; i++) {
      const o = opts[i]
      const c = comments[i]
      const a = approvals[i]
      const att = attachments[i]
      rows.push([
        d.id,
        d.title,
        d.status,
        d.created_at,
        d.updated_at,
        o?.id ?? '',
        o?.title ?? '',
        o?.description ?? '',
        String(o?.position ?? ''),
        c?.id ?? '',
        c?.author_name ?? '',
        c?.text ?? '',
        c?.created_at ?? '',
        a?.id ?? '',
        a?.approver_name ?? '',
        a?.status ?? '',
        a?.timestamp ?? '',
        att?.id ?? '',
        att?.filename ?? '',
        att?.url ?? '',
      ])
    }
  }

  return rows.map((r) => r.map(escapeCsv).join(',')).join('\n')
}

export function buildJSON(data: ExportData): string {
  const decisionsWithRelations = data.decisions.map((d) => {
    const opts = data.options.filter((o) => o.decision_id === d.id)
    const comments = data.comments.filter((c) => c.decision_id === d.id)
    const approvals = data.approvals.filter((a) => a.decision_id === d.id)
    const attachments = data.attachments.filter((a) => a.decision_id === d.id)
    return {
      ...d,
      options: opts,
      comments,
      approvals,
      attachments,
    }
  })
  return JSON.stringify(
    {
      metadata: data.metadata,
      decisions: decisionsWithRelations,
    },
    null,
    2
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildPDFHtml(
  data: ExportData,
  branding?: { logo_url?: string; primary_color?: string }
): string {
  const primaryColor = branding?.primary_color ?? '#195C4A'
  const logoHtml = branding?.logo_url
    ? `<img src="${escapeHtml(branding.logo_url)}" alt="Logo" style="max-height:32px" />`
    : ''

  const decisionsHtml = data.decisions
    .map((d) => {
      const opts = data.options.filter((o) => o.decision_id === d.id)
      const comments = data.comments.filter((c) => c.decision_id === d.id)
      const approvals = data.approvals.filter((a) => a.decision_id === d.id)
      const attachments = data.attachments.filter((a) => a.decision_id === d.id)

      const optsRows = opts
        .map(
          (o) =>
            `<tr><td>${escapeHtml(o.title)}</td><td>${escapeHtml(o.description ?? '')}</td><td>${o.position}</td><td>${o.is_recommended ? 'Yes' : 'No'}</td></tr>`
        )
        .join('')
      const commentsHtml = comments
        .map(
          (c) =>
            `<div style="margin-bottom:8px;padding:8px;border:1px solid #eee;border-radius:4px"><strong>${escapeHtml(c.author_name ?? '')}</strong> <span style="color:#666;font-size:12px">${escapeHtml(c.created_at)}</span><p style="margin:4px 0 0">${escapeHtml(c.text)}</p></div>`
        )
        .join('')
      const approvalsHtml = approvals
        .map(
          (a) =>
            `<div style="margin-bottom:4px"><strong>${escapeHtml(a.approver_name ?? '')}</strong> (${escapeHtml(a.role)}) — ${a.status} — ${escapeHtml(a.timestamp)}</div>`
        )
        .join('')
      const attachmentsHtml = attachments
        .map(
          (a) =>
            `<div style="margin-bottom:4px">${escapeHtml(a.filename)}</div>`
        )
        .join('')

      return `
        <div style="margin-bottom:24px;page-break-inside:avoid">
          <h2 style="color:${primaryColor};font-size:18px;margin-bottom:8px">${escapeHtml(d.title)}</h2>
          <div style="color:#6B7280;font-size:14px;margin-bottom:12px">Status: ${d.status} | Due: ${d.due_date ?? '—'} | Created: ${d.created_at}</div>
          ${d.description ? `<p style="margin-bottom:12px">${escapeHtml(d.description)}</p>` : ''}

          <h3 style="font-size:14px;margin:16px 0 8px;color:#6B7280">Options</h3>
          <table style="width:100%;border-collapse:collapse;margin:8px 0">
            <thead><tr style="background:#F5F6FA"><th style="border:1px solid #E6E8F0;padding:8px;text-align:left">Title</th><th style="border:1px solid #E6E8F0;padding:8px;text-align:left">Description</th><th style="border:1px solid #E6E8F0;padding:8px">Order</th><th style="border:1px solid #E6E8F0;padding:8px">Recommended</th></tr></thead>
            <tbody>${optsRows || '<tr><td colspan="4">No options</td></tr>'}</tbody>
          </table>

          <h3 style="font-size:14px;margin:16px 0 8px;color:#6B7280">Comments</h3>
          ${commentsHtml || '<p>No comments</p>'}

          <h3 style="font-size:14px;margin:16px 0 8px;color:#6B7280">Approval History</h3>
          ${approvalsHtml || '<p>No approvals</p>'}

          <h3 style="font-size:14px;margin:16px 0 8px;color:#6B7280">Attachments</h3>
          ${attachmentsHtml || '<p>No attachments</p>'}
        </div>
      `
    })
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Decision Log Export - ${escapeHtml(data.metadata.project_id)}</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; padding: 24px; color: #23272F; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 18px; margin: 24px 0 8px; }
    h3 { font-size: 14px; margin: 16px 0 8px; color: #6B7280; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    th, td { border: 1px solid #E6E8F0; padding: 8px 12px; text-align: left; }
    th { background: #F5F6FA; font-weight: 600; }
    .meta { color: #6B7280; font-size: 14px; margin-bottom: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #E6E8F0; }
  </style>
</head>
<body>
  <div class="header">
    <div>${logoHtml}</div>
    <div style="font-size:12px;color:#6B7280">Exported: ${data.metadata.export_timestamp}</div>
  </div>
  <h1>Decision Log Export</h1>
  <div class="meta">Project ID: ${escapeHtml(data.metadata.project_id)} | Export ID: ${escapeHtml(data.metadata.export_id)}</div>

  ${decisionsHtml}

  <p style="margin-top: 32px; font-size: 12px; color: #6B7280;">Archject Decision Log Export</p>
</body>
</html>`
}
