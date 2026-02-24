/**
 * PDF Export Service for Privacy Policy and legal documents
 * Uses html2pdf.js (jspdf + html2canvas) for client-side PDF generation
 */

import html2pdf from 'html2pdf.js'
import { buildPrivacyPolicyHtml, buildDecisionLogCoverHtml } from '@/lib/legal-templates'
import type { PrivacyPolicy } from '@/types/legal'

export interface PdfExportOptions {
  region?: string
  includeNotices?: boolean
  includeCoverPage?: boolean
  companyName?: string
}

/**
 * Renders policy HTML and exports to PDF using html2pdf.js
 */
export async function exportPrivacyPolicyToPdf(
  policy: PrivacyPolicy,
  options: PdfExportOptions = {}
): Promise<Blob> {
  const {
    region = 'EU',
    includeNotices = true,
    includeCoverPage = false,
    companyName = 'Archject',
  } = options

  const policyHtml = buildPrivacyPolicyHtml(policy, {
    companyName,
    includeRegionNotices: includeNotices,
    region,
  })

  let bodyContent = policyHtml
  if (includeCoverPage) {
    const coverHtml = buildDecisionLogCoverHtml({
      title: 'Privacy Policy',
      version: policy.version,
      date: policy.lastUpdated,
      companyName,
    })
    bodyContent = `<div style="page-break-after: always;">${coverHtml}</div>${policyHtml}`
  }

  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:Inter,system-ui,sans-serif;}</style></head><body>${bodyContent}</body></html>`

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
    if (!body) {
      throw new Error('Iframe body not ready')
    }
    const opts = {
      margin: 10,
      filename: `archject-privacy-policy-${policy.version}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }
    // html2pdf types omit pagebreak; library supports it
    const blob = await html2pdf().set(opts as never).from(body).outputPdf('blob')
    return blob
  } finally {
    document.body.removeChild(iframe)
  }
}

/**
 * Triggers download of the PDF blob.
 */
export function downloadPdfBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
