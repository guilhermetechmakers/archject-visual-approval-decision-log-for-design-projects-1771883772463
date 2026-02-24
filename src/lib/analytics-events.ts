/**
 * Analytics event helpers - Segment/Amplitude compatible
 * Use for consistent event naming and property schema across the app
 */

import { trackEvent } from '@/api/segment'
import type { SegmentEventName, SegmentEventProperties } from '@/types/segment'

export type AnalyticsEvent = SegmentEventName

export type AnalyticsEventProperties = SegmentEventProperties

/**
 * Track an analytics event with normalized properties (UTC, consistent keys)
 */
export async function trackAnalyticsEvent(
  event: AnalyticsEvent,
  properties?: AnalyticsEventProperties
): Promise<void> {
  const payload = {
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
    },
  }
  await trackEvent(payload).catch(() => {
    // Silently ignore - don't disrupt UX
  })
}

/** Decision lifecycle events */
export const analyticsEvents = {
  decisionCreated: (props: { workspace_id?: string; project_id?: string; decision_id?: string }) =>
    trackAnalyticsEvent('decision_created', props),
  decisionProposed: (props: { workspace_id?: string; project_id?: string; decision_id?: string }) =>
    trackAnalyticsEvent('decision_proposed', props),
  decisionUpdated: (props: { workspace_id?: string; decision_id?: string; decision_status?: string }) =>
    trackAnalyticsEvent('decision_updated', props),
  decisionClientView: (props: { workspace_id?: string; decision_id?: string; client_id?: string }) =>
    trackAnalyticsEvent('decision_client_view', props),
  decisionClientReply: (props: { workspace_id?: string; decision_id?: string; response_time_ms?: number }) =>
    trackAnalyticsEvent('decision_client_reply', props),
  decisionApproved: (props: { workspace_id?: string; decision_id?: string; decision_duration_ms?: number }) =>
    trackAnalyticsEvent('decision_approved', props),
  decisionRejected: (props: { workspace_id?: string; decision_id?: string }) =>
    trackAnalyticsEvent('decision_rejected', props),
  decisionClosed: (props: { workspace_id?: string; decision_id?: string }) =>
    trackAnalyticsEvent('decision_closed', props),

  /** Template events */
  templateViewed: (props: { workspace_id?: string; template_id?: string }) =>
    trackAnalyticsEvent('template_viewed', props),
  templateUsed: (props: { workspace_id?: string; template_id?: string; template_completion_rate?: number }) =>
    trackAnalyticsEvent('template_used', props),

  /** Export/report events */
  exportRequested: (props: { workspace_id?: string; export_format?: string }) =>
    trackAnalyticsEvent('export_requested', props),
  exportCompleted: (props: { workspace_id?: string; export_format?: string; report_id?: string }) =>
    trackAnalyticsEvent('export_completed', props),
  reportScheduled: (props: { workspace_id?: string; report_id?: string }) =>
    trackAnalyticsEvent('report_scheduled', props),

  /** Page views */
  dashboardViewed: (props: { workspace_id?: string }) =>
    trackAnalyticsEvent('dashboard_viewed', props),
  analyticsViewed: (props: Record<string, unknown>) =>
    trackAnalyticsEvent('analytics_viewed', props),
}
