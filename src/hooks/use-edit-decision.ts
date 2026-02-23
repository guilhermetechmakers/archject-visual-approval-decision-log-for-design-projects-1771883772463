/**
 * React Query hooks for Edit / Manage Decision page
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as editDecisionApi from '@/api/edit-decision'
import * as decisionsApi from '@/api/decisions'
import type {
  VersionedDecision,
  DecisionObject,
  DecisionVersion,
  ReissueSharePayload,
} from '@/types/edit-decision'

export function useVersionedDecision(
  projectIdOrDecisionId: string | undefined,
  decisionId?: string | undefined
) {
  const id = decisionId ?? projectIdOrDecisionId
  return useQuery({
    queryKey: ['decision', 'versioned', id],
    queryFn: () => editDecisionApi.fetchVersionedDecision(id!),
    enabled: !!id,
  })
}

export function useDecisionVersions(
  projectIdOrDecisionId: string | undefined,
  decisionId?: string | undefined
) {
  const id = decisionId ?? projectIdOrDecisionId
  return useQuery({
    queryKey: ['decision', id, 'versions'],
    queryFn: () => editDecisionApi.fetchDecisionVersions(id!),
    enabled: !!id,
  })
}

export function useDecisionVersion(
  decisionId: string | undefined,
  versionId: string | undefined
) {
  return useQuery({
    queryKey: ['decision', decisionId, 'version', versionId],
    queryFn: () =>
      editDecisionApi.fetchDecisionVersion(decisionId!, versionId!),
    enabled: !!decisionId && !!versionId,
  })
}

export function useAuditLog(
  projectIdOrDecisionId: string | undefined,
  decisionIdOrParams?: string | undefined | { limit?: number; filter?: string },
  params?: { limit?: number; filter?: string }
) {
  const id =
    typeof decisionIdOrParams === 'string'
      ? decisionIdOrParams
      : projectIdOrDecisionId
  const opts = params ?? (typeof decisionIdOrParams === 'object' ? decisionIdOrParams : undefined)
  return useQuery({
    queryKey: ['decision', id, 'audit', opts],
    queryFn: () => editDecisionApi.fetchAuditLog(id!, opts),
    enabled: !!id,
  })
}

export function useDecisionDiffs(
  decisionId: string | undefined,
  fromVersionId: string | undefined | null,
  toVersionId: string | undefined | null
) {
  return useQuery({
    queryKey: ['decision', decisionId, 'diffs', fromVersionId, toVersionId],
    queryFn: () =>
      editDecisionApi.fetchDecisionDiffs(decisionId!, {
        from: fromVersionId!,
        to: toVersionId!,
      }),
    enabled:
      !!decisionId &&
      !!fromVersionId &&
      !!toVersionId &&
      fromVersionId !== toVersionId,
  })
}

/** Alias for useDecisionDiffs - projectId unused, for API compatibility */
export function useVersionDiff(
  _projectId: string,
  decisionId: string,
  fromVersionId: string | null,
  toVersionId: string | null
) {
  return useDecisionDiffs(decisionId, fromVersionId, toVersionId)
}

export function useCreateVersionMutation(decisionId: string) {
  return useSaveDecisionVersionImpl(decisionId)
}

/** Alias - projectId unused, for API compatibility */
export function useSaveDecisionVersion(_projectId: string, decisionId: string) {
  return useSaveDecisionVersionImpl(decisionId)
}

function useSaveDecisionVersionImpl(decisionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: {
      snapshot: DecisionVersion['snapshot'] | DecisionObject[]
      note?: string
    }) => {
      const snapshot =
        Array.isArray(payload.snapshot)
          ? {
              title: '',
              decision_objects: payload.snapshot,
            }
          : payload.snapshot
      return editDecisionApi.createDecisionVersion(decisionId, {
        snapshot: snapshot as DecisionVersion['snapshot'],
        note: payload.note,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      queryClient.invalidateQueries({
        queryKey: ['decision', decisionId, 'versions'],
      })
      queryClient.invalidateQueries({
        queryKey: ['decision', decisionId, 'audit'],
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save version')
    },
  })
}

export function useReissueShareMutation(decisionId: string) {
  return useReissueShareLinkImpl(decisionId)
}

/** Alias - projectId unused, for API compatibility */
export function useReissueShareLink(_projectId: string, decisionId: string) {
  return useReissueShareLinkImpl(decisionId)
}

function useReissueShareLinkImpl(decisionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReissueSharePayload) =>
      editDecisionApi.reissueShareLink(decisionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      queryClient.invalidateQueries({
        queryKey: ['decision', decisionId, 'audit'],
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to generate share link')
    },
  })
}

export function useUpdateDecisionMetadataMutation(
  decisionId: string,
  projectId: string
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      title?: string
      description?: string
      category?: string
      due_date?: string
      tags?: string[]
      metadata?: Record<string, unknown>
    }) => decisionsApi.updateDecision(projectId, decisionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      queryClient.invalidateQueries({
        queryKey: ['decision', 'versioned', decisionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['workspace', 'decisions', projectId],
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update decision')
    },
  })
}

export function useUpdateDecisionStatusMutation(
  decisionId: string,
  projectId: string
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: VersionedDecision['status']) =>
      decisionsApi.updateDecision(projectId, decisionId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      queryClient.invalidateQueries({
        queryKey: ['decision', 'versioned', decisionId],
      })
      queryClient.invalidateQueries({
        queryKey: ['workspace', 'decisions', projectId],
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    },
  })
}

export function useDecisionObjectMutations(decisionId: string) {
  const queryClient = useQueryClient()

  const createObject = useMutation({
    mutationFn: (data: Partial<DecisionObject>) =>
      editDecisionApi.createDecisionObject(decisionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      queryClient.invalidateQueries({
        queryKey: ['decision', 'versioned', decisionId],
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add decision object')
    },
  })

  const updateObject = useMutation({
    mutationFn: ({
      objectId,
      data,
    }: {
      objectId: string
      data: Partial<DecisionObject>
    }) =>
      editDecisionApi.updateDecisionObject(decisionId, objectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      queryClient.invalidateQueries({
        queryKey: ['decision', 'versioned', decisionId],
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update decision object')
    },
  })

  const deleteObject = useMutation({
    mutationFn: (objectId: string) =>
      editDecisionApi.deleteDecisionObject(decisionId, objectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      queryClient.invalidateQueries({
        queryKey: ['decision', 'versioned', decisionId],
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete decision object')
    },
  })

  const reorderObjects = useMutation({
    mutationFn: (objectIds: string[]) =>
      editDecisionApi.reorderDecisionObjects(decisionId, objectIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      queryClient.invalidateQueries({
        queryKey: ['decision', 'versioned', decisionId],
      })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to reorder')
    },
  })

  return {
    createObject,
    updateObject,
    deleteObject,
    reorderObjects,
  }
}
