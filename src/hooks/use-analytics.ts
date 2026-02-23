/**
 * React Query hooks for analytics data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchStudioAnalytics,
  fetchDrilldown,
  fetchCustomReport,
  exportReport,
  scheduleReport,
} from '@/api/analytics'
import type {
  AnalyticsFilters,
  DrilldownFilters,
  ExportPayload,
  SchedulePayload,
} from '@/types/analytics'

const ANALYTICS_KEY = ['analytics'] as const
const DRILLDOWN_KEY = ['analytics', 'drilldown'] as const

export function useStudioAnalytics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'studio', filters],
    queryFn: () => fetchStudioAnalytics(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useDrilldown(
  filters: DrilldownFilters | null,
  page = 1,
  pageSize = 25
) {
  return useQuery({
    queryKey: [...DRILLDOWN_KEY, filters, page, pageSize],
    queryFn: () => fetchDrilldown(filters!, page, pageSize),
    enabled: !!filters,
    staleTime: 60 * 1000,
  })
}

export function useCustomReport(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'custom', filters],
    queryFn: () => fetchCustomReport(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useExportReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ExportPayload) => exportReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY })
    },
  })
}

export function useScheduleReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SchedulePayload) => scheduleReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY })
    },
  })
}
