/**
 * Search & Filter - types for unified search across Projects, Decisions, Files, Comments
 */

export type SearchEntityType = 'project' | 'decision' | 'file' | 'comment'

export interface SearchIndexDocument {
  id: string
  type: SearchEntityType
  projectId: string
  title: string
  excerpt: string
  content: string
  authorId: string | null
  createdAt: string
  updatedAt: string
  status: string
  tags: string[]
  assignees: string[]
  clientStatus?: string
  additionalFields?: Record<string, unknown>
}

export interface SearchResultItem {
  id: string
  type: SearchEntityType
  projectId: string
  projectName?: string
  title: string
  excerpt: string
  highlights?: Record<string, string[]>
  status: string
  tags: string[]
  assigneeName?: string
  createdAt: string
  updatedAt: string
  href: string
  metadata?: Record<string, unknown>
}

export interface SearchFilterFacet {
  facet: string
  values: string[]
}

export interface SearchQueryParams {
  query?: string
  filters?: SearchFilterFacet[]
  page?: number
  pageSize?: number
  sort?: { field: string; order: 'asc' | 'desc' }[]
  includeHighlights?: boolean
  entityTypes?: SearchEntityType[]
  projectId?: string
}

export interface SearchQueryResponse {
  results: SearchResultItem[]
  total: number
  page: number
  pageSize: number
  facets?: Record<string, { value: string; count: number }[]>
}

export interface AutocompleteSuggestion {
  id: string
  type: SearchEntityType
  title: string
  excerpt?: string
  href: string
}

export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[]
  savedSearches?: { id: string; name: string; query: string; filters?: SearchFilterFacet[] }[]
}

export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: SearchFilterFacet[]
  isShared: boolean
  createdAt: string
  updatedAt: string
}

export interface SearchExportParams {
  query: string
  filters?: SearchFilterFacet[]
  format: 'csv' | 'json' | 'pdf'
  selectedIds?: string[]
}
