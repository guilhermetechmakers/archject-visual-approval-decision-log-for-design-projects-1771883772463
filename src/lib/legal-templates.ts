/**
 * Legal document templates for PDF export.
 * Placeholders: companyName, lastUpdated, version, regionNotices (for Privacy Policy).
 * Reusable for Privacy Policy, Terms of Service, and Decision Log cover.
 */

import type {
  PrivacyPolicy,
  PolicySection,
  LegalDocument,
  ContentBlock,
} from '@/types/legal'

export function buildPrivacyPolicyHtml(
  policy: PrivacyPolicy,
  options: {
    companyName?: string
    includeRegionNotices?: boolean
    region?: string
  } = {}
): string {
  const { companyName = 'Archject', includeRegionNotices = true, region = 'EU' } = options

  const sectionsHtml = policy.sections
    .sort((a, b) => a.order - b.order)
    .map(
      (s) => `
    <div class="section" style="margin-bottom: 24px; page-break-inside: avoid;">
      <h2 style="font-size: 16px; font-weight: 600; color: #23272F; margin-bottom: 8px;">${escapeHtml(s.title)}</h2>
      <div class="content" style="font-size: 12px; line-height: 1.6; color: #23272F;">${formatContentForPdf(s.content)}</div>
    </div>
  `
    )
    .join('')

  const regionNotice = includeRegionNotices
    ? policy.regionNotices.find((n) => n.region === region)
    : null
  const regionHtml = regionNotice
    ? `
    <div class="region-notice" style="margin-top: 24px; padding: 16px; background: #F5F6FA; border-radius: 8px; font-size: 11px; color: #6B7280;">
      <strong style="color: #23272F;">${escapeHtml(regionNotice.region)} Notice:</strong>
      <div style="margin-top: 8px;">${formatContentForPdf(regionNotice.content)}</div>
    </div>
  `
    : ''

  return `
  <div style="font-family: Inter, 'SF Pro', system-ui, sans-serif; padding: 24px; color: #23272F; background: white;">
    <div style="border-bottom: 2px solid #195C4A; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="font-size: 24px; font-weight: 700; color: #195C4A;">${escapeHtml(policy.title)}</div>
      <div style="font-size: 11px; color: #6B7280; margin-top: 8px;">${escapeHtml(companyName)} • Version ${escapeHtml(policy.version)} • Last updated: ${escapeHtml(policy.lastUpdated)}</div>
    </div>
    ${sectionsHtml}
    ${regionHtml}
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E6E8F0; font-size: 10px; color: #6B7280;">
      ${escapeHtml(companyName)} • ${escapeHtml(policy.title)} • ${escapeHtml(policy.lastUpdated)}
    </div>
  </div>
  `.trim()
}

export function buildDecisionLogCoverHtml(options: {
  title?: string
  projectName?: string
  clientName?: string
  version?: string
  date?: string
  companyName?: string
  logoUrl?: string
}): string {
  const {
    title = 'Decision Log',
    projectName = '',
    clientName = '',
    version = '1.0',
    date = new Date().toISOString().split('T')[0],
    companyName = 'Archject',
    logoUrl,
  } = options

  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName)}" style="max-height: 48px; margin-bottom: 24px;" />`
    : `<div style="font-size: 24px; font-weight: 700; color: #195C4A; margin-bottom: 24px;">${escapeHtml(companyName)}</div>`

  return `
  <div style="font-family: Inter, system-ui, sans-serif; padding: 48px; color: #23272F; text-align: center; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
    ${logoHtml}
    <div style="font-size: 28px; font-weight: 700; color: #195C4A; margin-bottom: 16px;">${escapeHtml(title)}</div>
    ${projectName ? `<div style="font-size: 12px; color: #6B7280; margin: 8px 0;">Project: ${escapeHtml(projectName)}</div>` : ''}
    ${clientName ? `<div style="font-size: 12px; color: #6B7280; margin: 8px 0;">Client: ${escapeHtml(clientName)}</div>` : ''}
    <div style="font-size: 12px; color: #6B7280; margin: 8px 0;">Version: ${escapeHtml(version)}</div>
    <div style="font-size: 12px; color: #6B7280; margin: 8px 0;">Date: ${escapeHtml(date)}</div>
  </div>
  `.trim()
}

/**
 * Terms of Service template - uses LegalDocument structure with content blocks.
 */
export function buildTermsOfServiceHtml(
  doc: LegalDocument,
  options: { companyName?: string } = {}
): string {
  const companyName = options.companyName ?? doc.brandingMeta.companyName

  const sectionsHtml = doc.sections
    .map((section) => {
      const blocksHtml = section.contentBlocks
        .map((block) => formatContentBlockForPdf(block))
        .join('')
      return `
    <div class="section" style="margin-bottom: 24px; page-break-inside: avoid;">
      <h2 style="font-size: 16px; font-weight: 600; color: #23272F; margin-bottom: 8px;">${escapeHtml(section.title)}</h2>
      <div class="content" style="font-size: 12px; line-height: 1.6; color: #23272F;">${blocksHtml}</div>
    </div>
  `
    })
    .join('')

  return `
  <div style="font-family: Inter, 'SF Pro', system-ui, sans-serif; padding: 24px; color: #23272F; background: white;">
    <div style="border-bottom: 2px solid #195C4A; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="font-size: 24px; font-weight: 700; color: #195C4A;">${escapeHtml(doc.name)}</div>
      <div style="font-size: 11px; color: #6B7280; margin-top: 8px;">${escapeHtml(companyName)} • Version ${doc.version} • Effective: ${escapeHtml(doc.effectiveDate)} • Last updated: ${escapeHtml(doc.lastUpdated)}</div>
    </div>
    ${sectionsHtml}
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E6E8F0; font-size: 10px; color: #6B7280;">
      ${escapeHtml(companyName)} • ${escapeHtml(doc.name)} • ${escapeHtml(doc.lastUpdated)}
    </div>
  </div>
  `.trim()
}

function formatContentBlockForPdf(block: ContentBlock): string {
  switch (block.type) {
    case 'paragraph':
      return `<p style="margin: 0 0 12px 0;">${formatContentForPdf(block.content)}</p>`
    case 'subheading':
      return `<h3 style="font-size: 14px; font-weight: 600; color: #23272F; margin: 16px 0 8px 0;">${escapeHtml(block.content)}</h3>`
    case 'list':
      if (!block.bulletPoints?.length) return ''
      const items = block.bulletPoints
        .map((b) => `<li style="margin: 4px 0;">${escapeHtml(b)}</li>`)
        .join('')
      return `<ul style="margin: 0 0 12px 0; padding-left: 20px;">${items}</ul>`
    case 'blockquote':
      return `<blockquote style="margin: 12px 0; padding-left: 16px; border-left: 4px solid #195C4A; color: #6B7280; font-style: italic;">${escapeHtml(block.content)}</blockquote>`
    case 'link':
      if (!block.links?.length) return ''
      return block.links
        .map(
          (l) =>
            `<a href="${escapeHtml(l.href)}" style="color: #195C4A;">${escapeHtml(l.text)}</a>`
        )
        .join(' ')
    default:
      return ''
  }
}

/**
 * Legacy Terms of Service template - same structure as Privacy Policy for consistency.
 * @deprecated Use buildTermsOfServiceHtml with LegalDocument instead.
 */
export function buildTermsOfServiceHtmlLegacy(
  title: string,
  sections: PolicySection[],
  options: { companyName?: string; version?: string; lastUpdated?: string } = {}
): string {
  const {
    companyName = 'Archject',
    version = '1.0',
    lastUpdated = new Date().toISOString().split('T')[0],
  } = options

  const sectionsHtml = [...sections]
    .sort((a, b) => a.order - b.order)
    .map(
      (s) => `
    <div class="section" style="margin-bottom: 24px; page-break-inside: avoid;">
      <h2 style="font-size: 16px; font-weight: 600; color: #23272F; margin-bottom: 8px;">${escapeHtml(s.title)}</h2>
      <div class="content" style="font-size: 12px; line-height: 1.6; color: #23272F;">${formatContentForPdf(s.content)}</div>
    </div>
  `
    )
    .join('')

  return `
  <div style="font-family: Inter, 'SF Pro', system-ui, sans-serif; padding: 24px; color: #23272F; background: white;">
    <div style="border-bottom: 2px solid #195C4A; padding-bottom: 16px; margin-bottom: 24px;">
      <div style="font-size: 24px; font-weight: 700; color: #195C4A;">${escapeHtml(title)}</div>
      <div style="font-size: 11px; color: #6B7280; margin-top: 8px;">${escapeHtml(companyName)} • Version ${escapeHtml(version)} • Last updated: ${escapeHtml(lastUpdated)}</div>
    </div>
    ${sectionsHtml}
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E6E8F0; font-size: 10px; color: #6B7280;">
      ${escapeHtml(companyName)} • ${escapeHtml(title)} • ${escapeHtml(lastUpdated)}
    </div>
  </div>
  `.trim()
}

function escapeHtml(s: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return s.replace(/[&<>"']/g, (c) => map[c] ?? c)
}

function formatContentForPdf(content: string): string {
  return content
    .split(/\n\n+/)
    .map((para) => {
      const escaped = escapeHtml(para)
      const formatted = escaped
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>')
      return `<p style="margin: 0 0 12px 0;">${formatted}</p>`
    })
    .join('')
}
