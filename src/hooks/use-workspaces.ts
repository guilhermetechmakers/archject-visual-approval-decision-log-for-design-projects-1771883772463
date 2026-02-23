/**
 * useWorkspaces - React Query hook for workspace list
 * Falls back to mock data when API is unavailable
 */

import { useQuery } from '@tanstack/react-query'
import { fetchWorkspaces } from '@/api/dashboard'
import { mockWorkspaces } from '@/lib/dashboard-mock'
import type { WorkspaceOption } from '@/types/dashboard'

const QUERY_KEY = ['workspaces'] as const

export function useWorkspaces() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<WorkspaceOption[]> => {
      try {
        return await fetchWorkspaces()
      } catch {
        return mockWorkspaces
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}
