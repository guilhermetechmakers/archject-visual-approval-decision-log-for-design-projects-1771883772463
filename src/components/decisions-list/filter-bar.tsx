import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { DecisionsListFilters, DecisionsSortField, DecisionsSortOrder } from '@/types/decisions-list'
import type { DecisionStatus, TemplateType } from '@/types/workspace'
import type { TeamMember } from '@/types/workspace'

const STATUS_OPTIONS: { value: DecisionStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const TEMPLATE_OPTIONS: { value: TemplateType; label: string }[] = [
  { value: 'finishes', label: 'Finishes' },
  { value: 'layouts', label: 'Layouts' },
  { value: 'change_request', label: 'Change Request' },
]

const SORT_OPTIONS: { value: DecisionsSortField; label: string }[] = [
  { value: 'updated_at', label: 'Last updated' },
  { value: 'due_date', label: 'Due date' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
]

const QUICK_FILTERS: { value: DecisionsListFilters['quickFilter']; label: string }[] = [
  { value: 'my_decisions', label: 'My Decisions' },
  { value: 'awaiting_client', label: 'Awaiting Client' },
  { value: 'overdue', label: 'Overdue' },
]

export interface FilterBarProps {
  filters: DecisionsListFilters
  sort: DecisionsSortField
  order: DecisionsSortOrder
  onFiltersChange: (filters: DecisionsListFilters) => void
  onSortChange: (sort: DecisionsSortField, order: DecisionsSortOrder) => void
  team?: TeamMember[]
  searchDebounceMs?: number
  className?: string
}

export function FilterBar({
  filters,
  sort,
  order,
  onFiltersChange,
  onSortChange,
  team = [],
  searchDebounceMs = 300,
  className,
}: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  useEffect(() => {
    setSearchInput(filters.search ?? '')
  }, [filters.search])

  useEffect(() => {
    const t = setTimeout(() => {
      onFiltersChange({ ...filtersRef.current, search: searchInput || undefined })
    }, searchDebounceMs)
    return () => clearTimeout(t)
  }, [searchInput, searchDebounceMs, onFiltersChange])

  const handleSearchInput = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  const handleStatusChange = (value: string) => {
    if (value === 'all') {
      const { status: _, ...rest } = filters
      onFiltersChange(rest)
    } else {
      onFiltersChange({ ...filters, status: [value as DecisionStatus] })
    }
  }

  const handleAssigneeChange = (value: string) => {
    onFiltersChange({ ...filters, assigneeId: value === 'all' ? undefined : value })
  }

  const handleTemplateChange = (value: string) => {
    onFiltersChange({
      ...filters,
      templateType: value === 'all' ? undefined : (value as TemplateType),
    })
  }

  const handleQuickFilter = (value: DecisionsListFilters['quickFilter']) => {
    onFiltersChange({ ...filters, quickFilter: value })
  }

  const handleClearFilters = () => {
    setSearchInput('')
    onFiltersChange({})
  }

  const hasActiveFilters = useMemo(
    () =>
      !!(
        filters.search ||
        filters.status?.length ||
        filters.assigneeId ||
        filters.templateType ||
        filters.dueDateFrom ||
        filters.dueDateTo ||
        filters.quickFilter ||
        filters.tags?.length ||
        (filters.metadataKey && filters.metadataValue)
      ),
    [filters]
  )

  return (
    <div
      className={cn('flex flex-col gap-4', className)}
      role="search"
      aria-label="Filter and search decisions"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search decisions..."
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onFiltersChange({ ...filters, search: searchInput || undefined })}
            className="pl-9"
            aria-label="Search decisions"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {QUICK_FILTERS.map((qf) => (
            <Button
              key={qf.value ?? 'all'}
              variant={filters.quickFilter === qf.value ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onClick={() =>
                handleQuickFilter(
                  filters.quickFilter === qf.value ? undefined : qf.value
                )
              }
            >
              {qf.label}
            </Button>
          ))}

          <Select
            value={sort}
            onValueChange={(v) => onSortChange(v as DecisionsSortField, order)}
          >
            <SelectTrigger className="w-[140px]" aria-label="Sort by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onSortChange(sort, order === 'asc' ? 'desc' : 'asc')}
            aria-label={order === 'asc' ? 'Sort descending' : 'Sort ascending'}
          >
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', order === 'asc' && 'rotate-180')}
            />
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground"
              aria-label="Clear filters"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {filtersExpanded && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background p-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium text-muted-foreground">Filters</span>
          </div>
          <Select
            value={filters.status?.[0] ?? 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[140px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.assigneeId ?? 'all'}
            onValueChange={handleAssigneeChange}
          >
            <SelectTrigger className="w-[160px]" aria-label="Filter by assignee">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {team
                .filter((m) => m.role !== 'client')
                .map((m) => (
                  <SelectItem key={m.user_id} value={m.user_id}>
                    {m.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.templateType ?? 'all'}
            onValueChange={handleTemplateChange}
          >
            <SelectTrigger className="w-[140px]" aria-label="Filter by template">
              <SelectValue placeholder="Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All templates</SelectItem>
              {TEMPLATE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              placeholder="From"
              value={filters.dueDateFrom ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, dueDateFrom: e.target.value || undefined })
              }
              className="w-[140px]"
              aria-label="Due date from"
            />
            <Input
              type="date"
              placeholder="To"
              value={filters.dueDateTo ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, dueDateTo: e.target.value || undefined })
              }
              className="w-[140px]"
              aria-label="Due date to"
            />
          </div>
          <Input
            type="text"
            placeholder="Tags (comma-separated)"
            value={filters.tags?.join(', ') ?? ''}
            onChange={(e) => {
              const tags = e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
              onFiltersChange({ ...filters, tags: tags.length ? tags : undefined })
            }}
            className="w-[180px]"
            aria-label="Filter by tags"
          />
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Metadata key"
              value={filters.metadataKey ?? ''}
              onChange={(e) => {
                const key = e.target.value || undefined
                onFiltersChange({
                  ...filters,
                  metadataKey: key,
                  metadataValue: key ? filters.metadataValue : undefined,
                })
              }}
              className="w-[120px]"
              aria-label="Metadata key"
            />
            <Input
              type="text"
              placeholder="Metadata value"
              value={filters.metadataValue ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, metadataValue: e.target.value || undefined })
              }
              className="w-[120px]"
              aria-label="Metadata value"
            />
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-fit text-muted-foreground"
        onClick={() => setFiltersExpanded((e) => !e)}
        aria-expanded={filtersExpanded}
      >
        <Filter className="mr-2 h-4 w-4" />
        {filtersExpanded ? 'Hide filters' : 'Show more filters'}
      </Button>
    </div>
  )
}
