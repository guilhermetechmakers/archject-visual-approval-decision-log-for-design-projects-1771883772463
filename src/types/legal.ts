/**
 * Legal document types for Privacy Policy, Terms of Service, and export templates.
 */

export interface PolicySection {
  id: string
  order: number
  title: string
  content: string
}

export interface RegionNotice {
  region: string
  content: string
}

export interface PrivacyPolicy {
  id: string
  version: string
  lastUpdated: string
  title: string
  sections: PolicySection[]
  regionNotices: RegionNotice[]
}

export interface TemplateBranding {
  companyName: string
  logoUrl?: string
  contactInfo: string
}

export interface LegalTemplate {
  id: string
  name: 'PrivacyPolicy' | 'TermsOfService' | 'DecisionLogCover'
  version: string
  contentTemplate: string
  branding: TemplateBranding
}

export interface PdfExportOptions {
  region?: string
  includeNotices?: boolean
  includeCoverPage?: boolean
}

export type RegionCode = 'EU' | 'US' | 'APAC' | 'OTHER'
