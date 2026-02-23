/**
 * useDashboardData - React Query hook for dashboard payload
 * Falls back to mock data when API is unavailable
 */

import { useQuery } from '@tanstack/react-query'
import { fetchDashboard } from '@/api/dashboard'
import { mockDashboardPayload } from '@/lib/dashboard-mock'
import type { DashboardPayload } from '@/types/dashboard'

const QUERY_KEY = ['dashboard'] as const

export function useDashboardData(workspaceId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, workspaceId ?? 'default'],
    queryFn: async (): Promise<DashboardPayload> => {
      try {
        return await fetchDashboard(workspaceId)
      } catch {
        return mockDashboardPayload
      }
    },
    staleTime: 60 * 1000,
  })
}
