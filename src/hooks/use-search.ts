/**
 * Search & Filter - React Query hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as searchApi from '@/api/search'
import type {
  SearchQueryParams,
  SearchFilterFacet,
  SearchEntityType,
} from '@/types/search'

export const searchKeys = {
  all: ['search'] as const,
  query: (params: SearchQueryParams) => ['search', 'query', params] as const,
  autocomplete: (q: string, entity?: string) =>
    ['search', 'autocomplete', q, entity] as const,
  savedSearches: (workspaceId?: string | null) =>
    ['search', 'saved-searches', workspaceId] as const,
}

export function useSearchQuery(params: SearchQueryParams, enabled = true) {
  return useQuery({
    queryKey: searchKeys.query(params),
    queryFn: () => searchApi.searchQuery(params),
    enabled,
    staleTime: 30_000,
  })
}

export function useSearchAutocomplete(
  query: string,
  options?: { entityTypes?: SearchEntityType[]; enabled?: boolean }
) {
  const enabled = (options?.enabled ?? true) && query.trim().length >= 2
  return useQuery({
    queryKey: searchKeys.autocomplete(query, options?.entityTypes?.join(',')),
    queryFn: () => searchApi.searchAutocomplete(query, options?.entityTypes),
    enabled,
    staleTime: 10_000,
  })
}

export function useSavedSearches(workspaceId?: string | null) {
  return useQuery({
    queryKey: searchKeys.savedSearches(workspaceId),
    queryFn: () => searchApi.listSavedSearches(workspaceId),
    staleTime: 60_000,
  })
}

export function useCreateSavedSearch(workspaceId?: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      name: string
      query: string
      filters?: SearchFilterFacet[]
      isShared?: boolean
    }) =>
      searchApi.createSavedSearch({
        ...payload,
        workspaceId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.all })
      toast.success('Search saved')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save search')
    },
  })
}

export function useUpdateSavedSearch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: {
        name?: string
        query?: string
        filters?: SearchFilterFacet[]
        isShared?: boolean
      }
    }) => searchApi.updateSavedSearch(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.all })
      toast.success('Search updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update search')
    },
  })
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => searchApi.deleteSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.all })
      toast.success('Search deleted')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete search')
    },
  })
}

export function useSearchExport() {
  return useMutation({
    mutationFn: (params: {
      query: string
      filters?: SearchFilterFacet[]
      format: 'csv' | 'json' | 'pdf'
      selectedIds?: string[]
    }) => searchApi.searchExport(params),
    onSuccess: () => toast.success('Export started'),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to export'),
  })
}
