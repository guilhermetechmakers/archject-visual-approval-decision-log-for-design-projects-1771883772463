/**
 * Integrations API - Google Calendar, Autodesk Forge, Zapier
 * Uses Supabase Edge Functions for OAuth, calendar events, Forge previews
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  IntegrationDisplay,
  FieldMapping,
  ForgePreview,
  IntegrationActivity,
} from '@/types/integrations'

const FUNCTIONS = {
  connect: 'integrations-connect',
  disconnect: 'integrations-disconnect',
  calendarEvents: 'calendar-events',
  forgePreviews: 'forge-previews',
}

async function invoke<T>(name: string, body: unknown): Promise<T> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured')
  }
  const { data, error } = await supabase.functions.invoke(name, {
    body: body ?? {},
  })
  if (error) throw error
  if (data && typeof data === 'object' && 'success' in data && !(data as { success?: boolean }).success) {
    const msg = (data as { message?: string }).message ?? 'Request failed'
    throw new Error(msg)
  }
  return data as T
}

function mapIntegrationToDisplay(row: Record<string, unknown>): IntegrationDisplay {
  const provider = (row.provider as string) ?? 'unknown'
  const names: Record<string, string> = {
    google_calendar: 'Google Calendar',
    autodesk_forge: 'Autodesk Forge',
    zapier: 'Zapier',
  }
  return {
    id: row.id as string,
    type: provider as IntegrationDisplay['type'],
    name: names[provider] ?? provider,
    status: (row.status as IntegrationDisplay['status']) ?? 'disconnected',
    connectedAt: row.created_at as string | null,
    scopes: (row.scopes as string[]) ?? [],
    lastSyncAt: row.last_sync_at as string | null,
    lastError: row.last_error as string | null,
  }
}

export const integrationsApi = {
  async connect(provider: string, options?: { projectId?: string; workspaceId?: string }): Promise<{ authUrl?: string; message?: string }> {
    const data = await invoke<{ success: boolean; authUrl?: string; message?: string }>(
      FUNCTIONS.connect,
      { provider, projectId: options?.projectId, workspaceId: options?.workspaceId }
    )
    if (data.authUrl) {
      window.location.href = data.authUrl
      return { authUrl: data.authUrl }
    }
    return { message: data.message }
  },

  async disconnect(integrationId: string): Promise<void> {
    await invoke(FUNCTIONS.disconnect, { integrationId })
  },

  async list(): Promise<IntegrationDisplay[]> {
    if (!isSupabaseConfigured || !supabase) {
      return []
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- integrations table not in generated schema
    const { data, error } = await (supabase as any)
      .from('integrations')
      .select('id, provider, status, scopes, last_sync_at, last_error, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapIntegrationToDisplay)
  },

  async listByProject(projectId: string): Promise<IntegrationDisplay[]> {
    if (!isSupabaseConfigured || !supabase) {
      return []
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- integrations table not in generated schema
    const { data, error } = await (supabase as any)
      .from('integrations')
      .select('id, provider, status, scopes, last_sync_at, last_error, created_at')
      .or(`project_id.eq.${projectId},project_id.is.null`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapIntegrationToDisplay)
  },

  async createCalendarEvent(params: {
    decisionId: string
    integrationId?: string
    title: string
    start: string
    end?: string
    timezone?: string
  }): Promise<{ googleEventId?: string }> {
    return invoke(FUNCTIONS.calendarEvents, {
      action: 'create',
      ...params,
    })
  },

  async updateCalendarEvent(params: {
    googleEventId: string
    title: string
    start: string
    end?: string
    timezone?: string
  }): Promise<void> {
    await invoke(FUNCTIONS.calendarEvents, {
      action: 'update',
      ...params,
    })
  },

  async deleteCalendarEvent(googleEventId: string): Promise<void> {
    await invoke(FUNCTIONS.calendarEvents, {
      action: 'delete',
      googleEventId,
    })
  },

  async getForgePreview(decisionId: string, assetId?: string): Promise<ForgePreview> {
    return invoke(FUNCTIONS.forgePreviews, { decisionId, assetId })
  },

  async getMappings(integrationId: string): Promise<FieldMapping[]> {
    if (!isSupabaseConfigured || !supabase) {
      return []
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- integration_mappings table not in generated schema
    const { data, error } = await (supabase as any)
      .from('integration_mappings')
      .select('*')
      .eq('integration_id', integrationId)
    if (error) throw error
    return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as string,
      integrationId: r.integration_id as string,
      archjectField: r.archject_field as string,
      externalField: r.external_field as string,
      dataType: r.data_type as FieldMapping['dataType'],
      required: r.required as boolean,
      transformationScript: r.transformation_script as string | null,
    }))
  },

  async saveMappings(integrationId: string, mappings: Omit<FieldMapping, 'id' | 'integrationId'>[]): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase not configured')
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- integration_mappings table not in generated schema
    await (supabase as any).from('integration_mappings').delete().eq('integration_id', integrationId)
    if (mappings.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- integration_mappings table not in generated schema
      await (supabase as any).from('integration_mappings').insert(
        mappings.map((m) => ({
          integration_id: integrationId,
          archject_field: m.archjectField,
          external_field: m.externalField,
          data_type: m.dataType,
          required: m.required,
          transformation_script: m.transformationScript ?? null,
        }))
      )
    }
  },

  async getProjectActivity(projectId: string, limit = 10): Promise<IntegrationActivity[]> {
    if (!isSupabaseConfigured || !supabase) {
      return []
    }
    const { data: decisions } = await supabase
      .from('decisions')
      .select('id')
      .eq('project_id', projectId)
    const decisionIds = ((decisions ?? []) as Array<{ id: string }>).map((d) => d.id)
    if (decisionIds.length === 0) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- calendar_reminders table not in generated schema
    const { data: reminders } = await (supabase as any)
      .from('calendar_reminders')
      .select('id, decision_id, trigger_time, status, created_at')
      .in('decision_id', decisionIds)
      .order('created_at', { ascending: false })
      .limit(limit)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- forge_previews table not in generated schema
    const { data: previews } = await (supabase as any)
      .from('forge_previews')
      .select('id, decision_id, created_at')
      .in('decision_id', decisionIds)
      .order('created_at', { ascending: false })
      .limit(limit)

    const activities: IntegrationActivity[] = []
    ;((reminders ?? []) as Array<{ id: string; decision_id: string; trigger_time: string; status: string; created_at: string }>).forEach((r) => {
      activities.push({
        id: r.id,
        type: 'calendar_event',
        action: 'reminder_created',
        timestamp: r.created_at,
        status: r.status,
        metadata: { decisionId: r.decision_id, triggerTime: r.trigger_time },
      })
    })
    ;((previews ?? []) as Array<{ id: string; decision_id: string; created_at: string }>).forEach((p) => {
      activities.push({
        id: p.id,
        type: 'forge_preview',
        action: 'preview_generated',
        timestamp: p.created_at,
        status: 'created',
        metadata: { decisionId: p.decision_id },
      })
    })
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return activities.slice(0, limit)
  },
}
