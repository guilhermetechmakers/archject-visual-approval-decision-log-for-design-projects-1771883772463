/**
 * Mock settings data for when API is unavailable
 */

import type {
  UserProfile,
  Workspace,
  BillingInfo,
  NotificationSettings,
  Integration,
  Webhook,
  ApiKey,
  Session,
  DataExport,
  RetentionPolicy,
  AuditLogEntry,
  TeamMember,
} from '@/types/settings'

export const MOCK_PROFILE: UserProfile = {
  id: 'user_1',
  email: 'user@studio.com',
  name: 'Jane Smith',
  avatar: null,
  twoFactorEnabled: false,
}

export const MOCK_WORKSPACE: Workspace = {
  id: 'ws_1',
  name: 'My Studio',
  branding: {
    logoUrl: null,
    accentColor: '#195C4A',
    domainPrefix: 'clients',
    clientPortalUrl: 'https://clients.archject.app/studio-abc',
  },
  quotas: { storageGb: 10, projects: 5 },
  templates: ['default'],
}

export const MOCK_BILLING: BillingInfo = {
  plan: 'Starter',
  trialEnd: null,
  subscriptionId: 'sub_123',
  nextBillingDate: '2025-03-23',
  invoices: [
    { id: 'inv_1', date: '2025-02-23', amount: 29, currency: 'USD', status: 'paid', method: 'card' },
    { id: 'inv_2', date: '2025-01-23', amount: 29, currency: 'USD', status: 'paid', method: 'card' },
  ],
  paymentMethod: { last4: '4242', brand: 'Visa', expiryMonth: 12, expiryYear: 2026 },
}

export const MOCK_NOTIFICATIONS: NotificationSettings = {
  channels: {
    approvals: { inApp: true, email: true, sms: false },
    comments: { inApp: true, email: true, sms: false },
    reminders: { inApp: true, email: true, sms: false },
  },
  reminderSchedule: { defaultTime: '09:00', cadence: 'daily' },
}

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int_1', type: 'google_calendar', name: 'Google Calendar', status: 'connected', connectedAt: '2025-01-15T10:00:00Z' },
  { id: 'int_2', type: 'autodesk_forge', name: 'Autodesk Forge', status: 'disconnected' },
  { id: 'int_3', type: 'zapier', name: 'Zapier', status: 'disconnected' },
  { id: 'int_4', type: 'stripe', name: 'Stripe (Billing)', status: 'connected', connectedAt: '2025-01-01T00:00:00Z' },
]

export const MOCK_WEBHOOKS: Webhook[] = [
  { id: 'wh_1', url: 'https://api.example.com/webhooks/archject', events: ['approval.completed', 'decision.created'], enabled: true, lastTest: '2025-02-20T14:00:00Z' },
]

export const MOCK_API_KEYS: ApiKey[] = [
  { id: 'key_1', name: 'Production API', scopes: ['read', 'write'], createdAt: '2025-01-10T00:00:00Z', lastUsed: '2025-02-23T08:00:00Z', expiresAt: '2026-01-10', keyPreview: 'ak_••••••••••••xyz' },
]

export const MOCK_SESSIONS: Session[] = [
  { id: 'sess_1', device: 'Chrome on macOS', location: 'San Francisco, CA', lastUsed: '2025-02-23T10:00:00Z', current: true },
  { id: 'sess_2', device: 'Safari on iPhone', location: 'San Francisco, CA', lastUsed: '2025-02-22T18:30:00Z' },
]

export const MOCK_DATA_EXPORTS: DataExport[] = [
  { id: 'exp_1', status: 'completed', initiatedAt: '2025-02-20T12:00:00Z', completedAt: '2025-02-20T12:15:00Z', downloadUrl: 'https://exports.archject.app/exp_1.zip' },
]

export const MOCK_RETENTION: RetentionPolicy[] = [
  { workspaceId: 'ws_1', policyName: 'Default', duration: 365, type: 'decisions' },
]

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'log_1', actorId: 'user_1', action: 'settings.updated', target: 'notifications', timestamp: '2025-02-23T10:00:00Z', changes: { channels: { email: true } } },
  { id: 'log_2', actorId: 'user_1', action: 'api_key.created', target: 'key_1', timestamp: '2025-02-22T14:00:00Z' },
  { id: 'log_3', actorId: 'user_1', action: 'integration.connected', target: 'google_calendar', timestamp: '2025-02-20T09:00:00Z' },
]

export const MOCK_TEAM: TeamMember[] = [
  { id: 'tm_1', workspaceId: 'ws_1', userId: 'user_1', email: 'jane@studio.com', name: 'Jane Smith', role: 'admin', scopes: ['*'] },
  { id: 'tm_2', workspaceId: 'ws_1', userId: 'user_2', email: 'john@studio.com', name: 'John Doe', role: 'editor', scopes: ['decisions', 'files'] },
]

export const MOCK_CONNECTED_ACCOUNTS: { id: string; provider: string; email?: string; connected: boolean }[] = [
  { id: 'oauth_1', provider: 'google', email: 'user@studio.com', connected: false },
]
