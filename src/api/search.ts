/**
 * Search API - unified search across Projects, Decisions, Files, Comments
 * Uses Supabase RPC (search_unified, search_autocomplete) and saved_searches table
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  SearchQueryParams,
  SearchQueryResponse,
  SearchResultItem,
  AutocompleteResponse,
  SavedSearch,
  SearchFilterFacet,
} from '@/types/search'

const RPC_PAGE_SIZE_MIN = 10
const RPC_PAGE_SIZE_MAX = 100

function mapRpcRowToResult(row: {
  id: string
  entity_type: string
  project_id: string
  project_name: string | null
  title: string
  excerpt: string
  status: string
  created_at: string
  updated_at: string
  author_id: string | null
  href: string
}): SearchResultItem {
  return {
    id: row.id,
    type: row.entity_type as SearchResultItem['type'],
    projectId: row.project_id,
    projectName: row.project_name ?? undefined,
    title: row.title,
    excerpt: row.excerpt,
    status: row.status,
    tags: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    href: row.href,
    metadata: { authorId: row.author_id },
  }
}

export async function searchQuery(
  params: SearchQueryParams
): Promise<SearchQueryResponse> {
  if (!isSupabaseConfigured || !supabase) {
    return { results: [], total: 0, page: 1, pageSize: 25 }
  }

  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(
    RPC_PAGE_SIZE_MAX,
    Math.max(RPC_PAGE_SIZE_MIN, params.pageSize ?? 25)
  )
  const entityTypeFilter = params.filters?.find((f) => f.facet === 'entityType')
  const entityTypes =
    params.entityTypes?.length ? params.entityTypes
    : entityTypeFilter?.values?.length
      ? (entityTypeFilter.values as SearchQueryParams['entityTypes'])
      : undefined
  const statusFilter = params.filters?.find((f) => f.facet === 'status')
  const statusValues = statusFilter?.values?.length ? statusFilter.values : undefined
  const projectFilter = params.filters?.find((f) => f.facet === 'projectId')
  const projectIdFromFilter = projectFilter?.values?.[0]
  const projectId = params.projectId ?? projectIdFromFilter ?? null

  const statusMapped = statusValues?.map((s) => (s === 'approved' ? 'accepted' : s)) ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const resultsRes = await sb.rpc('search_unified', {
    p_query: params.query?.trim() ?? '',
    p_entity_types: entityTypes ?? null,
    p_project_id: projectId,
    p_status: statusMapped,
    p_page: page,
    p_page_size: pageSize,
    p_sort_field: params.sort?.[0]?.field ?? 'updated_at',
    p_sort_order: params.sort?.[0]?.order ?? 'desc',
  })

  if (resultsRes.error) {
    throw new Error(resultsRes.error.message)
  }

  const rows = (resultsRes.data ?? []) as Parameters<typeof mapRpcRowToResult>[0][]
  const results = rows.map(mapRpcRowToResult)
  const total = results.length

  return {
    results,
    total,
    page,
    pageSize,
  }
}

export async function searchAutocomplete(
  query: string,
  entityTypes?: SearchQueryParams['entityTypes'],
  limit = 8
): Promise<AutocompleteResponse> {
  if (!isSupabaseConfigured || !supabase) {
    return { suggestions: [] }
  }

  const trimmed = query?.trim() ?? ''
  if (trimmed.length < 2) {
    return { suggestions: [] }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('search_autocomplete', {
    p_query: trimmed,
    p_entity_types: entityTypes ?? null,
    p_limit: limit,
  })

  if (error) {
    return { suggestions: [] }
  }

  const rows = (data ?? []) as {
    id: string
    entity_type: string
    title: string
    excerpt: string
    href: string
  }[]

  const suggestions = rows.map((r) => ({
    id: r.id,
    type: r.entity_type as AutocompleteResponse['suggestions'][0]['type'],
    title: r.title,
    excerpt: r.excerpt,
    href: r.href,
  }))

  return { suggestions }
}

export async function logSearchAudit(
  query: string,
  filters: SearchFilterFacet[] | undefined,
  resultCount: number
): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('search_audit_log').insert({
    user_id: user.id,
    query: query || null,
    filters: filters ?? [],
    result_count: resultCount,
  })
}

export async function listSavedSearches(
  workspaceId?: string | null
): Promise<SavedSearch[]> {
  if (!isSupabaseConfigured || !supabase) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase as any).from('saved_searches').select('id, name, query, filters, is_shared, created_at, updated_at').order('updated_at', { ascending: false })
  if (workspaceId) {
    q = q.or(`workspace_id.eq.${workspaceId},workspace_id.is.null`)
  }
  const { data, error } = await q

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as Array<{ id: string; name: string; query: string | null; filters: unknown; is_shared: boolean; created_at: string; updated_at: string }>
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    query: row.query ?? '',
    filters: (row.filters as SearchFilterFacet[]) ?? [],
    isShared: row.is_shared ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function createSavedSearch(payload: {
  name: string
  query: string
  filters?: SearchFilterFacet[]
  isShared?: boolean
  workspaceId?: string | null
}): Promise<SavedSearch> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('saved_searches')
    .insert({
      user_id: user.id,
      workspace_id: payload.workspaceId ?? null,
      name: payload.name,
      query: payload.query,
      filters: payload.filters ?? [],
      is_shared: payload.isShared ?? false,
    })
    .select('id, name, query, filters, is_shared, created_at, updated_at')
    .single()

  if (error) throw new Error(error.message)

  const row = data as { id: string; name: string; query: string | null; filters: unknown; is_shared: boolean; created_at: string; updated_at: string }
  return {
    id: row.id,
    name: row.name,
    query: row.query ?? '',
    filters: (row.filters as SearchFilterFacet[]) ?? [],
    isShared: row.is_shared ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function updateSavedSearch(
  id: string,
  payload: Partial<Pick<SavedSearch, 'name' | 'query' | 'filters' | 'isShared'>>
): Promise<SavedSearch> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured')
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (payload.name !== undefined) update.name = payload.name
  if (payload.query !== undefined) update.query = payload.query
  if (payload.filters !== undefined) update.filters = payload.filters
  if (payload.isShared !== undefined) update.is_shared = payload.isShared

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('saved_searches')
    .update(update)
    .eq('id', id)
    .select('id, name, query, filters, is_shared, created_at, updated_at')
    .single()

  if (error) throw new Error(error.message)

  const d = data as { id: string; name: string; query: string | null; filters: unknown; is_shared: boolean; created_at: string; updated_at: string }
  return {
    id: d.id,
    name: d.name,
    query: d.query ?? '',
    filters: (d.filters as SearchFilterFacet[]) ?? [],
    isShared: d.is_shared ?? false,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  }
}

export async function deleteSavedSearch(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('saved_searches').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Alias for listSavedSearches for backward compatibility */
export async function fetchSavedSearches(): Promise<SavedSearch[]> {
  return listSavedSearches()
}

export async function searchExport(params: {
  query: string
  filters?: SearchFilterFacet[]
  format: 'csv' | 'json' | 'pdf'
  selectedIds?: string[]
}): Promise<{ jobId?: string; url?: string }> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.functions.invoke('search-export', {
      body: params,
    })
    return (data as { jobId?: string; url?: string }) ?? {}
  }
  return { url: undefined }
}
