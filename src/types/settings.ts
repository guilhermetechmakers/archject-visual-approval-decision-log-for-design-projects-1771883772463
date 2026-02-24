/**
 * Settings / Preferences types
 */

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string | null
  twoFactorEnabled: boolean
  /** User role (e.g. admin, editor, viewer) */
  role?: string
  /** IANA time zone (e.g. America/New_York) */
  timeZone?: string
  /** BCP 47 locale (e.g. en-US) */
  locale?: string
}

/** Domain/TLS configuration for custom client-facing links */
export interface DomainConfig {
  domain?: string | null
  prefix?: string | null
  tlsStatus?: 'pending' | 'provisioning' | 'active' | 'expired' | 'error' | null
  certificateArn?: string | null
  issuedAt?: string | null
  expiresAt?: string | null
}

/** Font settings for branding */
export interface FontSettings {
  family?: string
  weights?: number[]
}

/** Color token map for design system */
export interface ColorTokens {
  primary?: string
  secondary?: string
  accent?: string
  success?: string
  warning?: string
  destructive?: string
}

export interface WorkspaceBranding {
  logoUrl?: string | null
  logoAssetType?: 'svg' | 'png' | 'jpeg' | null
  primaryColor?: string
  secondaryColor?: string
  accentColor: string
  colorTokens?: ColorTokens | null
  fontSettings?: FontSettings | null
  domainPrefix?: string | null
  domainConfig?: DomainConfig | null
  clientPortalUrl?: string | null
  headerText?: string | null
  footerText?: string | null
  customCss?: string | null
}

/** Branding validation result */
export interface BrandingValidation {
  valid: boolean
  contrastPassed?: boolean
  logoSizeOk?: boolean
  errors?: string[]
}

export interface Workspace {
  id: string
  name: string
  branding: WorkspaceBranding
  quotas?: { storageGb?: number; projects?: number }
  templates?: string[]
}

export interface BillingInfo {
  plan: string
  trialEnd?: string | null
  subscriptionId?: string | null
  nextBillingDate?: string | null
  invoices: Invoice[]
  paymentMethod?: PaymentMethod | null
}

export interface Invoice {
  id: string
  date: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  method?: string
}

export interface PaymentMethod {
  last4: string
  brand: string
  expiryMonth: number
  expiryYear: number
}

export interface NotificationChannels {
  inApp: boolean
  email: boolean
  sms: boolean
}

export interface NotificationSettings {
  channels: {
    approvals: NotificationChannels
    comments: NotificationChannels
    reminders: NotificationChannels
  }
  reminderSchedule?: {
    defaultTime?: string
    cadence?: string
  }
  /** Per-workspace overrides; when set, these override global defaults */
  workspaceOverrides?: {
    workspaceId?: string
    workspaceName?: string
    channels?: {
      approvals?: Partial<NotificationChannels>
      comments?: Partial<NotificationChannels>
      reminders?: Partial<NotificationChannels>
    }
  }
}

export interface Integration {
  id: string
  type: 'google_calendar' | 'autodesk_forge' | 'zapier' | 'stripe'
  name: string
  status: 'connected' | 'disconnected' | 'error'
  connectedAt?: string | null
}

export interface Webhook {
  id: string
  url: string
  events: string[]
  enabled: boolean
  lastTest?: string | null
}

export interface ApiKey {
  id: string
  name: string
  scopes: string[]
  createdAt: string
  lastUsed?: string | null
  expiresAt?: string | null
  keyPreview?: string
}

export interface Session {
  id: string
  device: string
  location: string
  lastUsed: string
  current?: boolean
  /** Device details for display */
  os?: string
  browser?: string
  ipAddress?: string
  userAgent?: string
  deviceName?: string
}

export interface DataExport {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  initiatedAt: string
  completedAt?: string | null
  downloadUrl?: string | null
  format?: 'JSON' | 'CSV' | 'JSONL' | 'PDF'
}

export interface RetentionPolicy {
  workspaceId: string
  policyName: string
  duration: number
  type: 'projects' | 'decisions' | 'files'
}

export interface AuditLogEntry {
  id: string
  actorId: string
  action: string
  target: string
  timestamp: string
  changes?: Record<string, unknown>
}

export interface TeamMember {
  id: string
  workspaceId: string
  userId: string
  email: string
  name: string
  role: string
  scopes: string[]
}

export type SettingsSection =
  | 'overview'
  | 'account'
  | 'branding'
  | 'notifications'
  | 'integrations'
  | 'api-keys'
  | 'data-export'
  | 'sessions'
  | 'security'
  | 'team'
  | 'billing'
