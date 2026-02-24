/**
 * Legal document types for Privacy Policy, Terms of Service, and export templates.
 */

export interface PolicySection {
  id: string
  order: number
  title: string
  content: string
}

/** Link within a content block */
export interface LegalLink {
  text: string
  href: string
}

/** Content block types for structured legal documents (Terms of Service) */
export type ContentBlockType =
  | 'paragraph'
  | 'list'
  | 'subheading'
  | 'link'
  | 'blockquote'

export interface ContentBlock {
  type: ContentBlockType
  content: string
  bulletPoints?: string[]
  links?: LegalLink[]
}

export interface LegalSection {
  id: string
  title: string
  contentBlocks: ContentBlock[]
}

export interface LegalDocumentBranding {
  companyName: string
  logoUrl?: string
}

export interface LegalDocument {
  id: string
  name: string
  version: number
  effectiveDate: string
  lastUpdated: string
  sections: LegalSection[]
  brandingMeta: LegalDocumentBranding
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
