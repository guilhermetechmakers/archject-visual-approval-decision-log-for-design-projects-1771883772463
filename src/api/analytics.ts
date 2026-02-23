/**
 * Analytics API - studio analytics, drilldown, reports
 * Falls back to mock data when API is unavailable
 */

import { api } from '@/lib/api'
import { mockStudioAnalytics, getMockDrilldown } from '@/lib/analytics-mock'
import type {
  AnalyticsFilters,
  StudioAnalyticsResponse,
  DrilldownFilters,
  DrilldownResponse,
  ExportPayload,
  ExportResponse,
  SchedulePayload,
} from '@/types/analytics'

const USE_MOCK = !import.meta.env.VITE_API_URL

function buildQuery(params: Record<string, string | string[] | undefined>): string {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return
    if (Array.isArray(v)) {
      v.forEach((val) => qs.append(k, val))
    } else {
      qs.set(k, v)
    }
  })
  const s = qs.toString()
  return s ? `?${s}` : ''
}

export async function fetchStudioAnalytics(
  filters: AnalyticsFilters
): Promise<StudioAnalyticsResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return mockStudioAnalytics
  }
  const query = buildQuery({
    from: filters.from,
    to: filters.to,
    groupBy: filters.groupBy,
  })
  return api.get<StudioAnalyticsResponse>(`/analytics/studio${query}`)
}

export async function fetchDrilldown(
  filters: DrilldownFilters,
  page = 1,
  pageSize = 25
): Promise<DrilldownResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return getMockDrilldown(
      { type: filters.type, from: filters.from, to: filters.to },
      page,
      pageSize
    )
  }
  const query = buildQuery({
    type: filters.type,
    from: filters.from,
    to: filters.to,
    page: String(page),
    pageSize: String(pageSize),
    ...(filters.projectIds?.length && { projectIds: filters.projectIds }),
    ...(filters.stage && { stage: filters.stage }),
  })
  return api.get<DrilldownResponse>(`/analytics/studio/drilldown${query}`)
}

export async function fetchCustomReport(
  filters: AnalyticsFilters
): Promise<StudioAnalyticsResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 350))
    return mockStudioAnalytics
  }
  const query = buildQuery({
    from: filters.from,
    to: filters.to,
    groupBy: filters.groupBy,
  })
  return api.get<StudioAnalyticsResponse>(`/reports/custom${query}`)
}

export async function exportReport(payload: ExportPayload): Promise<ExportResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800))
    return {
      url: `https://archject.app/exports/report-${Date.now()}.${payload.type}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    }
  }
  return api.post<ExportResponse>('/reports/export', payload)
}

export async function scheduleReport(payload: SchedulePayload): Promise<{ id: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500))
    return { id: `schedule-${Date.now()}` }
  }
  return api.post<{ id: string }>('/reports/schedule', payload)
}
