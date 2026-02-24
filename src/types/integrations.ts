/**
 * Third-Party Integrations types
 */

export type IntegrationProvider = 'google_calendar' | 'autodesk_forge' | 'zapier'

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'

export interface Integration {
  id: string
  provider: IntegrationProvider
  userId: string
  projectId?: string | null
  workspaceId?: string | null
  status: IntegrationStatus
  scopes?: string[]
  lastSyncAt?: string | null
  lastError?: string | null
  connectedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface IntegrationDisplay {
  id: string
  type: IntegrationProvider
  name: string
  status: IntegrationStatus
  connectedAt?: string | null
  scopes?: string[]
  lastSyncAt?: string | null
  lastError?: string | null
}

export interface FieldMapping {
  id: string
  integrationId: string
  archjectField: string
  externalField: string
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'json'
  required: boolean
  transformationScript?: string | null
}

export interface CalendarReminder {
  id: string
  decisionId: string
  integrationId: string
  googleEventId?: string | null
  triggerTime: string
  status: 'pending' | 'created' | 'failed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface ForgePreview {
  id: string
  decisionId: string
  assetId?: string | null
  url: string
  token?: string | null
  expiresAt: string
  createdAt: string
}

export interface IntegrationActivity {
  id: string
  type: 'calendar_event' | 'forge_preview' | 'webhook_delivery'
  action: string
  timestamp: string
  status: string
  metadata?: Record<string, unknown>
}

export const ARCHJECT_DECISION_FIELDS = [
  { value: 'decision.title', label: 'Decision Title' },
  { value: 'decision.description', label: 'Decision Description' },
  { value: 'decision.deadline', label: 'Decision Deadline' },
  { value: 'decision.status', label: 'Decision Status' },
  { value: 'decision.created_at', label: 'Created At' },
  { value: 'decision.updated_at', label: 'Updated At' },
  { value: 'option.title', label: 'Option Title' },
  { value: 'option.cost', label: 'Option Cost' },
] as const

export const GOOGLE_CALENDAR_FIELDS = [
  { value: 'summary', label: 'Event Summary' },
  { value: 'description', label: 'Event Description' },
  { value: 'start', label: 'Start Time' },
  { value: 'end', label: 'End Time' },
  { value: 'location', label: 'Location' },
] as const

export const PROVIDER_NAMES: Record<IntegrationProvider, string> = {
  google_calendar: 'Google Calendar',
  autodesk_forge: 'Autodesk Forge',
  zapier: 'Zapier',
}
