/**
 * Branding Engine types - Workspace Branding & Custom Links
 */

export interface ColorTokens {
  primary?: string
  secondary?: string
  accent?: string
  background?: string
  foreground?: string
  muted?: string
}

export interface FontSettings {
  family?: string
  weights?: number[]
}

export interface DomainConfig {
  domain?: string | null
  prefix?: string | null
  tlsStatus?: 'pending' | 'provisioning' | 'active' | 'expired' | 'error'
  certificateArn?: string | null
  issuedAt?: string | null
  expiresAt?: string | null
}

export interface BrandingTokens {
  id?: string
  workspaceId?: string
  logoUrl?: string | null
  logoAssetType?: 'svg' | 'png' | 'jpeg'
  /** @deprecated Use colorTokens.accent */
  accentColor?: string
  colorTokens?: ColorTokens
  fontSettings?: FontSettings
  domainConfig?: DomainConfig
  headerText?: string | null
  footerText?: string | null
  customCss?: string | null
  previewTheme?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface BrandingValidationResult {
  valid: boolean
  contrastChecks?: {
    primary: { ratio: number; passes: boolean }
    accent: { ratio: number; passes: boolean }
  }
  logoSize?: { width: number; height: number; valid: boolean }
  domainConfig?: { valid: boolean; message?: string }
}

export interface BrandingPreviewPayload {
  tokens: BrandingTokens
  sampleContent?: string
}
