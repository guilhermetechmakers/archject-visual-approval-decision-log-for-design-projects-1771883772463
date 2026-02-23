/**
 * Settings / Preferences types
 */

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string | null
  twoFactorEnabled: boolean
}

export interface WorkspaceBranding {
  logoUrl?: string | null
  accentColor: string
  domainPrefix?: string | null
  clientPortalUrl?: string | null
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
}

export interface DataExport {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  initiatedAt: string
  completedAt?: string | null
  downloadUrl?: string | null
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
