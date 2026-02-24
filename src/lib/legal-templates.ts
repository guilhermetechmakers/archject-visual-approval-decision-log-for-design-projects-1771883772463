/**
 * Legal document templates for PDF export.
 * Placeholders: companyName, lastUpdated, version, regionNotices (for Privacy Policy).
 * Reusable for Privacy Policy, Terms of Service, and Decision Log cover.
 */

import type { PrivacyPolicy } from '@/types/legal'
import type { PolicySection } from '@/types/legal'

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
 * Terms of Service template - same structure as Privacy Policy for consistency.
 */
export function buildTermsOfServiceHtml(
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
