/**
 * Workspace Search & Filter Panel - live search, status, plan, domain, date range.
 */

import { Search, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { AdminWorkspacesFilters } from '@/api/admin'
import { cn } from '@/lib/utils'

export interface WorkspaceSearchFilterPanelProps {
  filters: AdminWorkspacesFilters
  onFiltersChange: (filters: AdminWorkspacesFilters) => void
  searchValue: string
  onSearchChange: (value: string) => void
  className?: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'pending', label: 'Pending' },
]

const PLAN_OPTIONS = [
  { value: '', label: 'All plans' },
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
]

export function WorkspaceSearchFilterPanel({
  filters,
  onFiltersChange,
  searchValue,
  onSearchChange,
  className,
}: WorkspaceSearchFilterPanelProps) {
  const handleSearchChange = (value: string) => {
    onSearchChange(value)
  }

  const handleReset = () => {
    onFiltersChange({})
    onSearchChange('')
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || searchValue

  return (
    <div className={cn('flex flex-wrap items-end gap-4', className)}>
      <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by domain, owner email, workspace ID..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search workspaces"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-status" className="text-xs text-muted-foreground">
            Status
          </Label>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(v) => onFiltersChange({ ...filters, status: v === 'all' ? undefined : v })}
          >
            <SelectTrigger id="filter-status" className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value || 'all'} value={o.value || 'all'}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-plan" className="text-xs text-muted-foreground">
            Plan
          </Label>
          <Select
            value={filters.plan ?? 'all'}
            onValueChange={(v) => onFiltersChange({ ...filters, plan: v === 'all' ? undefined : v })}
          >
            <SelectTrigger id="filter-plan" className="w-[140px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              {PLAN_OPTIONS.map((o) => (
                <SelectItem key={o.value || 'all'} value={o.value || 'all'}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} aria-label="Reset filters">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
