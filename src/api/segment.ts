/**
 * Segment / Analytics event tracking API
 * Captures decision lifecycle events for dashboards and usage metrics
 */

import { api } from '@/lib/api'
import type { SegmentTrackPayload } from '@/types/segment'

const USE_MOCK = !import.meta.env.VITE_API_URL

/**
 * Track an analytics event (Segment/Amplitude compatible)
 * Events are normalized to UTC and consistent schema
 */
export async function trackEvent(payload: SegmentTrackPayload): Promise<void> {
  const normalized: SegmentTrackPayload = {
    ...payload,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    properties: {
      ...payload.properties,
      timestamp: payload.timestamp ?? new Date().toISOString(),
    },
  }

  if (USE_MOCK) {
    if (typeof window !== 'undefined' && (window as unknown as { __segmentDebug?: boolean }).__segmentDebug) {
      // eslint-disable-next-line no-console
      console.debug('[Segment]', normalized.event, normalized.properties)
    }
    return
  }

  await api.post('/segment/track', normalized)
}
