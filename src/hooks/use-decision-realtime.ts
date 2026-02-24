/**
 * Supabase Realtime subscription for decision comments and annotations
 * Keeps UI in sync when other users add/edit/delete comments or annotations
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export function useDecisionRealtime(decisionId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !decisionId) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any
    if (typeof client.channel !== 'function') return

    const channel = client.channel(`decision:${decisionId}`)

    const handleCommentChange = () => {
      queryClient.invalidateQueries({ queryKey: ['decision-detail', decisionId] })
    }

    const handleAnnotationChange = () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', decisionId] })
      queryClient.invalidateQueries({ queryKey: ['decision-detail', decisionId] })
    }

    channel
      .on(
        'postgres_changes',
        {
          schema: 'public',
          table: 'decision_comments',
          filter: `decision_id=eq.${decisionId}`,
        },
        handleCommentChange
      )
      .on(
        'postgres_changes',
        {
          schema: 'public',
          table: 'decision_annotations',
          filter: `decision_id=eq.${decisionId}`,
        },
        handleAnnotationChange
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [decisionId, queryClient])
}
