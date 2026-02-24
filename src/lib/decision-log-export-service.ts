/**
 * Decision Log Export Service - Client-side PDF/CSV/JSON generation.
 * Generates human-readable PDF and machine-ready CSV/JSON from decision log data.
 */

import html2pdf from 'html2pdf.js'
import { buildDecisionLogCoverHtml } from '@/lib/legal-templates'
import { downloadCsv } from '@/lib/report-export-service'
export interface DecisionLogExportRow {
  decision_id: string
  decision_text: string
  option_id?: string
  option_text?: string
  comments?: string
  approvals_status: string
  approved_by?: string
  attachments?: string
  timestamp: string
  approved: boolean
}

export interface DecisionLogExportData {
  projectId: string
  projectName: string
  decisionLogId?: string
  decisionLogTitle?: string
  decisions: Array<{
    id: string
    title: string
    status: string
    approvedAt?: string | null
    approvedBy?: string | null
    options?: Array<{ id: string; title: string }>
    comments?: Array<{ text: string; author?: string; createdAt: string }>
    attachments?: Array<{ id: string; fileName: string; url?: string }>
  }>
  exportedAt: string
}

function escapeHtml(s: string): string {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

function buildDecisionLogPdfHtml(data: DecisionLogExportData): string {
  const sections = data.decisions.map(
    (d) => `
    <div style="margin-bottom: 24px; page-break-inside: avoid;">
      <h3 style="font-size: 14px; font-weight: 600; color: #23272F; margin-bottom: 8px;">${escapeHtml(d.title)}</h3>
      <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">Status: ${escapeHtml(d.status)}</div>
      ${d.approvedAt ? `<div style="font-size: 11px; color: #6B7280;">Approved: ${escapeHtml(d.approvedAt)}</div>` : ''}
      ${d.options?.length ? `
        <div style="margin-top: 12px;">
          <div style="font-size: 11px; font-weight: 500; color: #23272F; margin-bottom: 4px;">Options:</div>
          <ul style="margin: 0; padding-left: 20px; font-size: 11px; color: #23272F;">
            ${d.options.map((o) => `<li>${escapeHtml(o.title)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${d.attachments?.length ? `
        <div style="margin-top: 8px; font-size: 10px; color: #6B7280;">
          Attachments: ${d.attachments.map((a) => escapeHtml(a.fileName)).join(', ')}
        </div>
      ` : ''}
    </div>
  `
  ).join('')

  const coverHtml = buildDecisionLogCoverHtml({
    title: data.decisionLogTitle ?? 'Decision Log',
    projectName: data.projectName,
    date: data.exportedAt,
    companyName: 'Archject',
  })

  return `
  <div style="font-family: Inter, system-ui, sans-serif; padding: 24px; color: #23272F;">
    <div style="page-break-after: always;">${coverHtml}</div>
    <div style="border-bottom: 2px solid #195C4A; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="font-size: 20px; font-weight: 700; color: #195C4A;">${escapeHtml(data.projectName)}</div>
      <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">Exported: ${escapeHtml(data.exportedAt)}</div>
    </div>
    ${sections}
  </div>
  `.trim()
}

export function generateDecisionLogCsv(data: DecisionLogExportData): string {
  const rows: DecisionLogExportRow[] = []
  for (const d of data.decisions) {
    const base = {
      decision_id: d.id,
      decision_text: d.title,
      approvals_status: d.status,
      approved_by: d.approvedBy ?? '',
      attachments: d.attachments?.map((a) => a.id).join(';') ?? '',
      timestamp: d.approvedAt ?? d.id,
      approved: d.status === 'approved',
    }
    if (d.options?.length) {
      for (const o of d.options) {
        rows.push({
          ...base,
          option_id: o.id,
          option_text: o.title,
          comments: d.comments?.map((c) => c.text).join(' | ') ?? '',
        })
      }
    } else {
      rows.push({
        ...base,
        comments: d.comments?.map((c) => c.text).join(' | ') ?? '',
      })
    }
  }

  const headers = Object.keys(rows[0] ?? {}) as (keyof DecisionLogExportRow)[]
  const escape = (s: string) => {
    const str = String(s)
    if (str.includes(',') || str.includes('"') || str.includes('\n'))
      return `"${str.replace(/"/g, '""')}"`
    return str
  }
  const headerLine = headers.map(escape).join(',')
  const dataLines = rows.map((r) => headers.map((h) => escape(String(r[h] ?? ''))).join(','))
  return [data.projectName, '', headerLine, ...dataLines].join('\n')
}

export function generateDecisionLogJson(data: DecisionLogExportData): string {
  const output = {
    projectId: data.projectId,
    projectName: data.projectName,
    decisionLogId: data.decisionLogId,
    decisionLogTitle: data.decisionLogTitle,
    exportedAt: data.exportedAt,
    decisions: data.decisions.map((d) => ({
      decision_id: d.id,
      decision_text: d.title,
      approvals_status: d.status,
      approved_by: d.approvedBy,
      approved_at: d.approvedAt,
      options: d.options,
      comments: d.comments,
      attachments: d.attachments?.map((a) => ({ id: a.id, fileName: a.fileName, url: a.url })),
    })),
  }
  return JSON.stringify(output, null, 2)
}

export async function exportDecisionLogToPdf(
  data: DecisionLogExportData
): Promise<Blob> {
  const html = buildDecisionLogPdfHtml(data)
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:Inter,system-ui,sans-serif;}</style></head><body>${html}</body></html>`

  const iframe = document.createElement('iframe')
  iframe.style.position = 'absolute'
  iframe.style.left = '-9999px'
  iframe.style.width = '210mm'
  iframe.style.height = '297mm'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  if (!doc) {
    document.body.removeChild(iframe)
    throw new Error('Could not create iframe for PDF export')
  }

  doc.open()
  doc.write(fullHtml)
  doc.close()

  try {
    const body = doc.body
    if (!body) throw new Error('Iframe body not ready')
    const opts = {
      margin: 10,
      filename: `decision-log-${data.projectName.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }
    const blob = await html2pdf().set(opts as never).from(body).outputPdf('blob')
    return blob
  } finally {
    document.body.removeChild(iframe)
  }
}

export function downloadDecisionLogJson(data: DecisionLogExportData): void {
  const json = generateDecisionLogJson(data)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `decision-log-${data.projectName.replace(/\s+/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadDecisionLogCsv(data: DecisionLogExportData): void {
  const csv = generateDecisionLogCsv(data)
  downloadCsv(csv, `decision-log-${data.projectName.replace(/\s+/g, '-')}.csv`)
}
