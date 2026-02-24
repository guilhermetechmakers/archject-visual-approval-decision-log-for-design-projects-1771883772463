/**
 * User Filters Panel - search, status, role, last activity.
 * Advanced filters for Admin User Management.
 * Uses design tokens, accessible labels, mobile-first layout.
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

export interface UserFilters {
  search: string
  status: string
  role: string
  lastActivity: string
}

interface UserFiltersPanelProps {
  filters: UserFilters
  onFiltersChange: (f: UserFilters) => void
  onReset: () => void
  className?: string
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
]

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
]

const ACTIVITY_OPTIONS = [
  { value: 'all', label: 'Any activity' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'inactive', label: 'Inactive (90d+)' },
]

export function UserFiltersPanel({
  filters,
  onFiltersChange,
  onReset,
  className,
}: UserFiltersPanelProps) {
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
    filters.role !== 'all' ||
    filters.lastActivity !== 'all' ||
    (filters.search ?? '').trim() !== ''

  return (
    <div
      role="group"
      aria-label="User filters"
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center',
        className
      )}
    >
      <div className="relative w-full flex-1 sm:max-w-xs">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search by name, email, ID..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="min-h-[44px] pl-9"
          aria-label="Search users by name, email, or ID"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={filters.status}
          onValueChange={(v) => onFiltersChange({ ...filters, status: v })}
        >
          <SelectTrigger
            className="min-h-[44px] w-full sm:w-[140px]"
            aria-label="Filter by status"
          >
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
          value={filters.role}
          onValueChange={(v) => onFiltersChange({ ...filters, role: v })}
        >
          <SelectTrigger
            className="min-h-[44px] w-full sm:w-[140px]"
            aria-label="Filter by role"
          >
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.lastActivity}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, lastActivity: v })
          }
        >
          <SelectTrigger
            className="min-h-[44px] w-full sm:w-[160px]"
            aria-label="Filter by last activity"
          >
            <SelectValue placeholder="Last activity" />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="min-h-[44px]"
            aria-label="Reset all filters"
          >
            <X className="mr-1 h-4 w-4" aria-hidden />
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
