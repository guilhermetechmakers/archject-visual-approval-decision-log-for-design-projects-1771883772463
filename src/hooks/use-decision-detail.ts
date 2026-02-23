/**
 * React Query hooks for Decision Detail (Internal view)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as decisionDetailApi from '@/api/decision-detail'
import { getMockDecisionDetail } from '@/lib/decision-detail-mock'
import type { DecisionOption } from '@/types/decision-detail'

const USE_MOCK = true

export function useDecisionDetail(decisionId: string | undefined) {
  return useQuery({
    queryKey: ['decision-detail', decisionId],
    queryFn: async () => {
      if (USE_MOCK && decisionId) {
        return getMockDecisionDetail(decisionId)
      }
      return decisionDetailApi.fetchDecisionDetail(decisionId!)
    },
    enabled: !!decisionId,
  })
}

export function useCreateShareLink(decisionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: decisionDetailApi.ShareLinkPayload) => {
      if (USE_MOCK) {
        const base = window.location.origin
        const token = `mock-${decisionId}-${Date.now()}`
        return {
          id: `link-${token}`,
          url: `${base}/portal/${token}`,
          expiresAt: payload.expiresAt ?? null,
          otpRequired: payload.otpRequired ?? false,
        }
      }
      return decisionDetailApi.createShareLink(decisionId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-detail', decisionId] })
      toast.success('Share link generated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create share link')
    },
  })
}

export function useRevokeApproval(decisionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => decisionDetailApi.revokeApproval(decisionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-detail', decisionId] })
      queryClient.invalidateQueries({ queryKey: ['decision', decisionId] })
      toast.success('Approval revoked')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke approval')
    },
  })
}

export function useCreateComment(decisionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: {
      content: string
      parentCommentId?: string | null
      mentions?: string[]
    }) => {
      if (USE_MOCK) {
        return {
          id: `com-${Date.now()}`,
          decisionId,
          parentCommentId: payload.parentCommentId ?? null,
          authorId: 'current-user',
          authorName: 'You',
          content: payload.content,
          createdAt: new Date().toISOString(),
          mentions: payload.mentions ?? [],
        }
      }
      return decisionDetailApi.createComment(decisionId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-detail', decisionId] })
      toast.success('Comment added')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add comment')
    },
  })
}

export function useUpdateOptionRecommended(decisionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      optionId,
      isRecommended,
    }: {
      optionId: string
      isRecommended: boolean
    }) => {
      if (USE_MOCK) {
        return {
          id: optionId,
          decisionId,
          title: '',
          isRecommended,
          order: 0,
          attachments: [],
          mediaPreviewIds: [],
          dependencies: [],
        } as DecisionOption
      }
      return decisionDetailApi.updateOptionRecommended(
        decisionId,
        optionId,
        isRecommended
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision-detail', decisionId] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update option')
    },
  })
}
