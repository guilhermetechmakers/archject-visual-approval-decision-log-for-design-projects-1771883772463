/**
 * Search page - full-text search with faceted filters, results grid, saved searches
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, BookmarkPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FacetedFilterPanel,
  SearchResultsGrid,
  SavedSearchesPanel,
} from '@/components/search'
import { buildFacetSectionsFromResults } from '@/lib/facet-utils'
import {
  useSearchQuery,
  useCreateSavedSearch,
} from '@/hooks/use-search'
import { useDashboardData } from '@/hooks/use-dashboard'
import { logSearchAudit } from '@/api/search'
import type { SearchFilterFacet, SearchEntityType } from '@/types/search'

function parseFiltersFromUrl(searchParams: URLSearchParams): SearchFilterFacet[] {
  const filters: SearchFilterFacet[] = []
  const entityTypes = searchParams.get('type')
  if (entityTypes) {
    filters.push({
      facet: 'entityType',
      values: entityTypes.split(',').filter(Boolean),
    })
  }
  const status = searchParams.get('status')
  if (status) {
    filters.push({ facet: 'status', values: status.split(',').filter(Boolean) })
  }
  const projectId = searchParams.get('project')
  if (projectId) {
    filters.push({ facet: 'projectId', values: [projectId] })
  }
  return filters
}

function filtersToUrlParams(filters: SearchFilterFacet[]): Record<string, string> {
  const params: Record<string, string> = {}
  const entityType = filters.find((f) => f.facet === 'entityType')
  if (entityType?.values?.length) {
    params.type = entityType.values.join(',')
  }
  const status = filters.find((f) => f.facet === 'status')
  if (status?.values?.length) {
    params.status = status.values.join(',')
  }
  const project = filters.find((f) => f.facet === 'projectId')
  if (project?.values?.[0]) {
    params.project = project.values[0]
  }
  return params
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const qFromUrl = searchParams.get('q') ?? ''
  const pageFromUrl = parseInt(searchParams.get('page') ?? '1', 10)

  const [query, setQuery] = useState(qFromUrl)
  const [filters, setFilters] = useState<SearchFilterFacet[]>(() =>
    parseFiltersFromUrl(searchParams)
  )
  const [page, setPage] = useState(pageFromUrl)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveName, setSaveName] = useState('')

  const { data: dashboardData } = useDashboardData()
  const projects = dashboardData?.projects ?? []

  const searchParamsForApi = {
    query: query || undefined,
    filters: filters.length ? filters : undefined,
    page,
    pageSize: 25,
    sort: [{ field: 'updated_at' as const, order: 'desc' as const }],
    entityTypes: filters
      .find((f) => f.facet === 'entityType')
      ?.values as SearchEntityType[] | undefined,
    projectId: filters.find((f) => f.facet === 'projectId')?.values?.[0],
  }

  const hasSearchCriteria = query.trim().length > 0 || filters.length > 0
  const { data, isLoading } = useSearchQuery(
    searchParamsForApi,
    hasSearchCriteria
  )
  const createSavedMutation = useCreateSavedSearch()

  useEffect(() => {
    const q = searchParams.get('q') ?? ''
    setQuery(q)
    setFilters(parseFiltersFromUrl(searchParams))
    setPage(parseInt(searchParams.get('page') ?? '1', 10))
  }, [searchParams])

  const syncUrl = useCallback(
    (updates: { q?: string; filters?: SearchFilterFacet[]; page?: number }) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        const q = updates.q ?? next.get('q') ?? ''
        const f = updates.filters ?? filters
        const p = updates.page ?? page

        if (q) next.set('q', q)
        else next.delete('q')
        next.set('page', String(p))

        const filterParams = filtersToUrlParams(f)
        Object.entries(filterParams).forEach(([k, v]) => next.set(k, v))
        ;['type', 'status', 'project'].forEach((k) => {
          if (!filterParams[k]) next.delete(k)
        })

        return next
      })
    },
    [setSearchParams, filters, page]
  )

  const handleSearchSubmit = (q: string) => {
    setQuery(q)
    setPage(1)
    syncUrl({ q, page: 1 })
  }

  const handleFiltersChange = (newFilters: SearchFilterFacet[]) => {
    setFilters(newFilters)
    setPage(1)
    syncUrl({ filters: newFilters, page: 1 })
  }

  const handleLoadSavedSearch = (s: { query: string; filters: SearchFilterFacet[] }) => {
    setQuery(s.query)
    setFilters(s.filters)
    setPage(1)
    syncUrl({ q: s.query, filters: s.filters, page: 1 })
  }

  const handleSaveSearch = () => {
    if (!saveName.trim()) return
    createSavedMutation.mutate({
      name: saveName.trim(),
      query,
      filters,
    })
    setSaveModalOpen(false)
    setSaveName('')
  }

  useEffect(() => {
    if (data && (query || filters.length)) {
      logSearchAudit(query, filters, data.total)
    }
  }, [data?.total, query, filters])

  const results = data?.results ?? []
  const total = data?.total ?? 0
  const pageSize = 25
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const facetSections = useMemo(
    () =>
      buildFacetSectionsFromResults(
        results.map((r) => ({ type: r.type, status: r.status, projectName: r.projectName })),
        projects.map((p) => ({ id: p.id, name: p.name }))
      ),
    [results, projects]
  )

  const selectedFacets: Record<string, string[]> = useMemo(() => {
    const sel: Record<string, string[]> = {}
    for (const f of filters) {
      if (f.facet === 'entityType') sel.entity_type = f.values
      else if (f.facet === 'status') sel.status = f.values
      else if (f.facet === 'projectId') sel.project_id = f.values
    }
    return sel
  }, [filters])

  const handleFacetChange = useCallback(
    (facet: string, values: string[]) => {
      const next = filters.filter((x) => {
        if (facet === 'entity_type') return x.facet !== 'entityType'
        if (facet === 'status') return x.facet !== 'status'
        if (facet === 'project_id') return x.facet !== 'projectId'
        return true
      })
      if (values.length > 0) {
        const facetMap = { entity_type: 'entityType' as const, status: 'status' as const, project_id: 'projectId' as const }
        next.push({ facet: facetMap[facet as keyof typeof facetMap] ?? facet, values })
      }
      handleFiltersChange(next)
    },
    [filters, handleFiltersChange]
  )

  const handleClearFilters = useCallback(() => {
    handleFiltersChange([])
  }, [handleFiltersChange])

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Search</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search projects, decisions, files, comments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && handleSearchSubmit((e.target as HTMLInputElement).value)
            }
            className="pl-9 rounded-lg bg-input"
            aria-label="Search"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => handleSearchSubmit(query)}
          >
            Search
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => setSaveModalOpen(true)}
            disabled={!query && filters.length === 0}
          >
            <BookmarkPlus className="mr-2 h-4 w-4" />
            Save search
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr_200px]">
        <aside className="order-2 lg:order-1">
          <FacetedFilterPanel
            sections={facetSections}
            selected={selectedFacets}
            onSelectionChange={handleFacetChange}
            onClearAll={handleClearFilters}
          />
        </aside>

        <main className="order-1 lg:order-2 min-w-0">
          <SearchResultsGrid
            results={results}
            isLoading={isLoading}
            showBulkActions={false}
          />

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  const p = Math.max(1, page - 1)
                  setPage(p)
                  syncUrl({ page: p })
                }}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => {
                  const p = Math.min(totalPages, page + 1)
                  setPage(p)
                  syncUrl({ page: p })
                }}
              >
                Next
              </Button>
            </div>
          )}
        </main>

        <aside className="order-3">
          <SavedSearchesPanel
            onLoadSearch={handleLoadSavedSearch}
          />
        </aside>
      </div>

      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg animate-fade-in-up">
            <h2 className="text-lg font-semibold">Save this search</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Give your search a name to quickly reuse it later.
            </p>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Pending decisions"
              className="mt-4 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSearch}
                disabled={!saveName.trim() || createSavedMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
