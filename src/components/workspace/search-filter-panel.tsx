import { Search } from 'lucide-react'
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
import { useState, useCallback } from 'react'
import type { DecisionStatus } from '@/types/workspace'

export interface SearchFilterPanelProps {
  onSearch?: (query: string, scope?: string) => void
  onFilterChange?: (filters: Record<string, unknown>) => void
  placeholder?: string
  className?: string
}

const scopes = [
  { value: 'all', label: 'All' },
  { value: 'projects', label: 'Projects' },
  { value: 'decisions', label: 'Decisions' },
  { value: 'files', label: 'Files' },
  { value: 'comments', label: 'Comments' },
]

const statusFilters: { value: DecisionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export function SearchFilterPanel({
  onSearch,
  onFilterChange,
  placeholder = 'Search projects, decisions, files, comments...',
  className,
}: SearchFilterPanelProps) {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('all')
  const [status, setStatus] = useState<string>('all')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSearch?.(query, scope)
    },
    [query, scope, onSearch]
  )

  const handleStatusChange = useCallback(
    (value: string) => {
      setStatus(value)
      onFilterChange?.({ status: value === 'all' ? undefined : value })
    },
    [onFilterChange]
  )

  return (
    <div className={cn('space-y-4', className)}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Search"
          />
        </div>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scopes.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
