/**
 * Workspace Filters Panel - search, status, plan, domain.
 */

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface WorkspaceFilters {
  search: string
  status: string
  plan: string
  domain: string
}

interface WorkspaceFiltersPanelProps {
  filters: WorkspaceFilters
  onFiltersChange: (f: WorkspaceFilters) => void
  onReset: () => void
  className?: string
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'pending', label: 'Pending' },
]

const PLAN_OPTIONS = [
  { value: 'all', label: 'All plans' },
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
]

export function WorkspaceFiltersPanel({
  filters,
  onFiltersChange,
  onReset,
  className,
}: WorkspaceFiltersPanelProps) {
  const [searchInput, setSearchInput] = React.useState(filters.search)
  const debouncedSearch = useDebounce(searchInput, 300)

  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch })
    }
  }, [debouncedSearch])

  React.useEffect(() => {
    setSearchInput(filters.search)
  }, [filters.search])

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.plan !== 'all' ||
    (filters.domain ?? '').trim() !== '' ||
    (filters.search ?? '').trim() !== ''

  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      <div className="relative max-w-xs flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, ID, domain, owner..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
          aria-label="Search workspaces"
        />
      </div>
      <Select
        value={filters.status}
        onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.plan}
        onValueChange={(v) => onFiltersChange({ ...filters, plan: v })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Plan" />
        </SelectTrigger>
        <SelectContent>
          {PLAN_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Domain filter..."
        value={filters.domain}
        onChange={(e) => onFiltersChange({ ...filters, domain: e.target.value })}
        className="w-[160px]"
        aria-label="Filter by domain"
      />
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-4 w-4" />
          Reset
        </Button>
      )}
    </div>
  )
}
