/**
 * React Query hooks for Third-Party Integrations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { integrationsApi } from '@/api/integrations'
import { MOCK_INTEGRATIONS } from '@/lib/settings-mock'
import type { IntegrationDisplay, FieldMapping } from '@/types/integrations'

const INTEGRATIONS_KEYS = ['integrations'] as const

function withIntegrationsFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return fn()
  } catch {
    return Promise.resolve(fallback)
  }
}

export function useIntegrations() {
  return useQuery({
    queryKey: [...INTEGRATIONS_KEYS, 'list'],
    queryFn: () =>
      withIntegrationsFallback(() => integrationsApi.list(), []).then((list) => {
        if (list.length > 0) return list
        return MOCK_INTEGRATIONS.map((m) => ({
          id: m.id,
          type: m.type,
          name: m.name,
          status: m.status,
          connectedAt: m.connectedAt ?? null,
          scopes: [],
          lastSyncAt: null,
          lastError: null,
        })) as IntegrationDisplay[]
      }),
  })
}

/** Alias for useIntegrations - returns list of integrations */
export const useIntegrationsList = useIntegrations

export function useProjectIntegrations(projectId: string) {
  return useQuery({
    queryKey: [...INTEGRATIONS_KEYS, 'project', projectId],
    queryFn: () => withIntegrationsFallback(() => integrationsApi.listByProject(projectId), []),
    enabled: !!projectId,
  })
}

export function useConnectIntegration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variables: { provider: string; projectId?: string; workspaceId?: string }) =>
      integrationsApi.connect(variables.provider, {
        projectId: variables.projectId,
        workspaceId: variables.workspaceId,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INTEGRATIONS_KEYS })
    },
  })
}

export function useDisconnectIntegration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (integrationId: string) => integrationsApi.disconnect(integrationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: INTEGRATIONS_KEYS })
    },
  })
}

export function useIntegrationMappings(integrationId: string | null) {
  return useQuery({
    queryKey: [...INTEGRATIONS_KEYS, 'mappings', integrationId],
    queryFn: () =>
      integrationId ? integrationsApi.getMappings(integrationId) : Promise.resolve([]),
    enabled: !!integrationId,
  })
}

export function useSaveIntegrationMappings(integrationId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (mappings: Omit<FieldMapping, 'id' | 'integrationId'>[]) => {
      if (!integrationId) throw new Error('Integration ID required')
      return integrationsApi.saveMappings(integrationId, mappings)
    },
    onSuccess: () => {
      if (integrationId) {
        qc.invalidateQueries({ queryKey: [...INTEGRATIONS_KEYS, 'mappings', integrationId] })
      }
    },
  })
}

/** Alias for useSaveIntegrationMappings */
export function useUpdateIntegrationMappings(integrationId: string | null) {
  return useSaveIntegrationMappings(integrationId)
}

export function useCreateCalendarEvent() {
  return useMutation({
    mutationFn: (params: {
      decisionId: string
      integrationId?: string
      title: string
      start: string
      end?: string
      timezone?: string
    }) => integrationsApi.createCalendarEvent(params),
  })
}

export function useForgePreview(decisionId: string | null, assetId?: string) {
  return useQuery({
    queryKey: [...INTEGRATIONS_KEYS, 'forge', decisionId, assetId],
    queryFn: () =>
      decisionId ? integrationsApi.getForgePreview(decisionId, assetId) : Promise.reject(),
    enabled: !!decisionId,
  })
}

export function useProjectIntegrationActivity(projectId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: [...INTEGRATIONS_KEYS, 'activity', projectId, limit],
    queryFn: () => integrationsApi.getProjectActivity(projectId!, limit ?? 10),
    enabled: !!projectId,
  })
}
