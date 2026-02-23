/**
 * Export engine for Decision Detail - PDF, CSV, JSON
 * Client-side generation for PDF/CSV/JSON when API is not available
 */

import type {
  DecisionOption,
  DecisionComment,
  DecisionApproval,
  DecisionFile,
} from '@/types/decision-detail'

export interface ExportDecisionBase {
  id: string
  title: string
  status: string
  description?: string | null
  due_date?: string | null
  created_at?: string
  updated_at?: string
}

export interface ExportPayload {
  decision: ExportDecisionBase
  options?: DecisionOption[]
  comments?: DecisionComment[]
  approvals?: DecisionApproval[]
  files?: DecisionFile[]
}

export function exportDecisionAsJSON(payload: ExportPayload): string {
  const data = {
    decision: payload.decision,
    options: payload.options ?? [],
    comments: payload.comments ?? [],
    approvals: payload.approvals ?? [],
    files: payload.files ?? [],
    exportedAt: new Date().toISOString(),
  }
  return JSON.stringify(data, null, 2)
}

export function exportDecisionAsCSV(payload: ExportPayload): string {
  const rows: string[][] = []
  const escape = (v: unknown) =>
    `"${String(v ?? '').replace(/"/g, '""')}"`

  rows.push(['Decision ID', 'Title', 'Status', 'Due Date', 'Created', 'Updated'])
  const d = payload.decision
  rows.push([
    d.id,
    d.title,
    d.status,
    d.due_date ?? '',
    d.created_at ?? '',
    d.updated_at ?? '',
  ])
  rows.push([])

  if (payload.options && payload.options.length > 0) {
    rows.push(['Option ID', 'Title', 'Cost', 'Lead Time', 'Recommended'])
    payload.options.forEach((o) => {
      rows.push([
        o.id,
        o.title,
        o.cost ?? '',
        String(o.leadTime ?? ''),
        o.isRecommended ? 'Yes' : 'No',
      ])
    })
    rows.push([])
  }

  if (payload.comments && payload.comments.length > 0) {
    rows.push(['Comment ID', 'Author', 'Content', 'Created'])
    payload.comments.forEach((c) => {
      rows.push([c.id, c.authorName ?? '', c.content, c.createdAt])
    })
    rows.push([])
  }

  if (payload.approvals && payload.approvals.length > 0) {
    rows.push(['Approval ID', 'Actor', 'Role', 'Action', 'Timestamp'])
    payload.approvals.forEach((a) => {
      rows.push([a.id, a.actorName ?? '', a.role, a.action, a.timestamp])
    })
  }

  return rows.map((r) => r.map(escape).join(',')).join('\n')
}

export function exportDecisionAsPDF(payload: ExportPayload): void {
  const html = buildPDFHtml(payload)
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.print()
  win.close()
}

function buildPDFHtml(payload: ExportPayload): string {
  const options = payload.options ?? []
  const comments = payload.comments ?? []
  const approvals = payload.approvals ?? []
  const files = payload.files ?? []

  const optionsHtml = options
    .map(
      (o) =>
        `<tr><td>${escapeHtml(o.title)}</td><td>${escapeHtml(o.cost ?? '')}</td><td>${o.leadTime ?? ''}</td><td>${o.isRecommended ? 'Yes' : 'No'}</td></tr>`
    )
    .join('')

  const commentsHtml = comments
    .map(
      (c) =>
        `<div style="margin-bottom:8px;padding:8px;border:1px solid #eee;border-radius:4px"><strong>${escapeHtml(c.authorName ?? '')}</strong> <span style="color:#666;font-size:12px">${escapeHtml(c.createdAt)}</span><p style="margin:4px 0 0">${escapeHtml(c.content)}</p></div>`
    )
    .join('')

  const approvalsHtml = approvals
    .map(
      (a) =>
        `<div style="margin-bottom:4px"><strong>${escapeHtml(a.actorName ?? '')}</strong> (${escapeHtml(a.role)}) — ${a.action} — ${escapeHtml(a.timestamp)}</div>`
    )
    .join('')

  const filesHtml = files
    .map(
      (f) =>
        `<div style="margin-bottom:4px">${escapeHtml(f.fileName)} (v${f.version})</div>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Decision Export - ${escapeHtml(payload.decision.title)}</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; padding: 24px; color: #23272F; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 16px; margin: 24px 0 8px; color: #6B7280; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    th, td { border: 1px solid #E6E8F0; padding: 8px 12px; text-align: left; }
    th { background: #F5F6FA; font-weight: 600; }
    .meta { color: #6B7280; font-size: 14px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(payload.decision.title)}</h1>
  <div class="meta">Status: ${payload.decision.status} | Due: ${payload.decision.due_date ?? '—'} | Exported: ${new Date().toISOString()}</div>
  ${payload.decision.description ? `<p>${escapeHtml(payload.decision.description)}</p>` : ''}

  <h2>Options</h2>
  <table>
    <thead><tr><th>Title</th><th>Cost</th><th>Lead Time</th><th>Recommended</th></tr></thead>
    <tbody>${optionsHtml || '<tr><td colspan="4">No options</td></tr>'}</tbody>
  </table>

  <h2>Comments</h2>
  ${commentsHtml || '<p>No comments</p>'}

  <h2>Approval History</h2>
  ${approvalsHtml || '<p>No approvals</p>'}

  <h2>Files</h2>
  ${filesHtml || '<p>No files</p>'}

  <p style="margin-top: 32px; font-size: 12px; color: #6B7280;">Archject Decision Log Export</p>
</body>
</html>`
}

function escapeHtml(s: string): string {
  const el = document.createElement('div')
  el.textContent = s
  return el.innerHTML
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
