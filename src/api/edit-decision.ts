/**
 * Edit / Manage Decision API - versioned decisions, audit, share, diffs
 */

import { api } from '@/lib/api'
import type {
  VersionedDecision,
  DecisionVersion,
  DecisionObject,
  AuditLogEntry,
  ShareLink,
  VersionDiff,
  ReissueSharePayload,
} from '@/types/edit-decision'

const USE_MOCK = true

function mockDelay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), 100))
}

export async function fetchVersionedDecision(
  decisionId: string
): Promise<VersionedDecision> {
  if (USE_MOCK) {
    return mockDelay({
      id: decisionId,
      project_id: 'proj-1',
      title: 'Kitchen Finishes - Countertops',
      description: 'Select countertop material and finish.',
      category: 'Finishes',
      owner_id: null,
      status: 'draft' as const,
      current_version_id: 'ver-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      due_date: '2025-03-01',
      tags: ['kitchen', 'finishes'],
      metadata: {},
      decision_objects: [
        {
          id: 'obj-1',
          decision_id: decisionId,
          title: 'Countertop Material',
          description: 'Primary material selection',
          order_index: 0,
          status: 'draft' as const,
          metadata: {},
          options: [
            {
              id: 'opt-1',
              decision_object_id: 'obj-1',
              label: 'Quartz',
              media_url: null,
              cost: '$2,500',
              dependencies: {},
              order_index: 0,
            },
            {
              id: 'opt-2',
              decision_object_id: 'obj-1',
              label: 'Granite',
              media_url: null,
              cost: '$3,200',
              dependencies: {},
              order_index: 1,
            },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      current_version: {
        id: 'ver-1',
        decision_id: decisionId,
        version_number: 1,
        snapshot: {
          title: 'Kitchen Finishes - Countertops',
          description: 'Select countertop material and finish.',
          category: 'Finishes',
          decision_objects: [],
        },
        created_at: new Date().toISOString(),
        author_id: null,
        author_name: null,
        note: null,
      },
    })
  }
  return api.get<VersionedDecision>(`/decisions/${decisionId}`)
}

export async function fetchDecisionVersions(
  decisionId: string
): Promise<DecisionVersion[]> {
  if (USE_MOCK) {
    return mockDelay([
      {
        id: 'ver-1',
        decision_id: decisionId,
        version_number: 1,
        snapshot: { title: 'Kitchen Finishes - Countertops', decision_objects: [] },
        created_at: new Date().toISOString(),
        author_id: null,
        author_name: null,
        note: 'Initial version',
      },
    ])
  }
  return api.get<DecisionVersion[]>(`/decisions/${decisionId}/versions`)
}

export async function fetchDecisionVersion(
  decisionId: string,
  versionId: string
): Promise<DecisionVersion> {
  if (USE_MOCK) {
    return mockDelay({
      id: versionId,
      decision_id: decisionId,
      version_number: 1,
      snapshot: { title: 'Kitchen Finishes - Countertops', decision_objects: [] },
      created_at: new Date().toISOString(),
      author_id: null,
      author_name: null,
      note: null,
    })
  }
  return api.get<DecisionVersion>(`/decisions/${decisionId}/versions/${versionId}`)
}

export async function createDecisionVersion(
  decisionId: string,
  payload: { snapshot: DecisionVersion['snapshot']; note?: string }
): Promise<DecisionVersion> {
  if (USE_MOCK) {
    return mockDelay({
      id: `ver-${Date.now()}`,
      decision_id: decisionId,
      version_number: 2,
      snapshot: payload.snapshot,
      created_at: new Date().toISOString(),
      author_id: null,
      author_name: null,
      note: payload.note ?? null,
    })
  }
  return api.post<DecisionVersion>(`/decisions/${decisionId}/versions`, payload)
}

export async function fetchDecisionDiffs(
  decisionId: string,
  params: { from: string; to: string }
): Promise<VersionDiff> {
  if (USE_MOCK) {
    return mockDelay({
      from_version_id: params.from,
      to_version_id: params.to,
      fields: [
        {
          field: 'title',
          path: 'title',
          oldValue: 'Kitchen Finishes',
          newValue: 'Kitchen Finishes - Countertops',
          type: 'modified',
        },
      ],
      metadata_diffs: [],
      options_diffs: [],
      media_diffs: [],
      comments_diffs: [],
    })
  }
  const qs = new URLSearchParams(params).toString()
  return api.get<VersionDiff>(`/decisions/${decisionId}/diffs?${qs}`)
}

export async function fetchAuditLog(
  decisionId: string,
  params?: { limit?: number; filter?: string }
): Promise<AuditLogEntry[]> {
  if (USE_MOCK) {
    return mockDelay([
      {
        id: 'audit-1',
        decision_id: decisionId,
        version_id: 'ver-1',
        action: 'created',
        user_id: null,
        user_name: 'System',
        timestamp: new Date().toISOString(),
        details: {},
      },
      {
        id: 'audit-2',
        decision_id: decisionId,
        version_id: null,
        action: 'updated',
        user_id: null,
        user_name: 'You',
        timestamp: new Date().toISOString(),
        details: { fields: ['title'] },
      },
    ])
  }
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return api.get<AuditLogEntry[]>(`/decisions/${decisionId}/audit${qs ? `?${qs}` : ''}`)
}

export async function reissueShareLink(
  decisionId: string,
  payload: ReissueSharePayload
): Promise<ShareLink> {
  if (USE_MOCK) {
    const token = `tok-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    return mockDelay({
      id: `share-${Date.now()}`,
      decision_id: decisionId,
      url: `${window.location.origin}/portal/${token}`,
      expires_at: payload.expires_at ?? null,
      access_scope: payload.access_scope ?? 'read',
      created_by: null,
      is_active: true,
      created_at: new Date().toISOString(),
    })
  }
  return api.post<ShareLink>(`/decisions/${decisionId}/share`, payload)
}

export async function createDecisionObject(
  decisionId: string,
  data: Partial<DecisionObject>
): Promise<DecisionObject> {
  if (USE_MOCK) {
    return mockDelay({
      id: `obj-${Date.now()}`,
      decision_id: decisionId,
      title: data.title ?? 'Untitled',
      description: data.description ?? null,
      order_index: data.order_index ?? 0,
      status: (data.status ?? 'draft') as DecisionObject['status'],
      metadata: data.metadata ?? {},
      options: data.options ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }
  return api.post<DecisionObject>(`/decisions/${decisionId}/objects`, data)
}

export async function updateDecisionObject(
  decisionId: string,
  objectId: string,
  data: Partial<DecisionObject>
): Promise<DecisionObject> {
  if (USE_MOCK) {
    return mockDelay({
      id: objectId,
      decision_id: decisionId,
      title: data.title ?? 'Untitled',
      description: data.description ?? null,
      order_index: data.order_index ?? 0,
      status: (data.status ?? 'draft') as DecisionObject['status'],
      metadata: data.metadata ?? {},
      options: data.options ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }
  return api.put<DecisionObject>(`/decisions/${decisionId}/objects/${objectId}`, data)
}

export async function deleteDecisionObject(
  decisionId: string,
  objectId: string
): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined)
  return api.delete(`/decisions/${decisionId}/objects/${objectId}`)
}

export async function reorderDecisionObjects(
  decisionId: string,
  objectIds: string[]
): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined)
  return api.post(`/decisions/${decisionId}/objects/reorder`, { object_ids: objectIds })
}
