/**
 * Hook for Segment/analytics event tracking
 */

import { useCallback } from 'react'
import { trackEvent } from '@/api/segment'
import type { SegmentTrackPayload } from '@/types/segment'

export function useSegmentTrack() {
  const track = useCallback((payload: SegmentTrackPayload) => {
    trackEvent(payload).catch(() => {
      // Silently ignore tracking errors - don't disrupt UX
    })
  }, [])

  return { track }
}
