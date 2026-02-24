/**
 * React Query hooks for decision annotations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as annotationsApi from '@/api/annotations'
import type { CreateAnnotationPayload } from '@/api/annotations'

export function useAnnotations(decisionId: string | undefined) {
  return useQuery({
    queryKey: ['annotations', decisionId],
    queryFn: () => annotationsApi.fetchAnnotations(decisionId!),
    enabled: !!decisionId,
  })
}

export function useCreateAnnotation(decisionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAnnotationPayload & { shape?: string }) =>
      annotationsApi.createAnnotation(decisionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', decisionId] })
      queryClient.invalidateQueries({ queryKey: ['decision-detail', decisionId] })
      toast.success('Annotation added')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add annotation')
    },
  })
}

export function useDeleteAnnotation(decisionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (annotationId: string) =>
      annotationsApi.deleteAnnotation(decisionId, annotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', decisionId] })
      queryClient.invalidateQueries({ queryKey: ['decision-detail', decisionId] })
      toast.success('Annotation removed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove annotation')
    },
  })
}
